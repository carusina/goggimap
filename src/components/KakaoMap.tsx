'use client'

import Script from 'next/script'
import { useRef } from 'react'
import type { Restaurant } from '@/types'

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    kakao: any
  }
}

interface KakaoMapProps {
  restaurants: Restaurant[]
  center?: { lat: number; lng: number }
  onMarkerClick?: (restaurant: Restaurant) => void
}

function makePriceSvg(price: number): string {
  const text = `${price.toLocaleString()}원`
  const width = Math.max(64, text.length * 8 + 28)
  const height = 32
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect x="1.5" y="1.5" width="${width - 3}" height="${height - 3}" rx="15" ry="15"
      fill="white" stroke="#111827" stroke-width="2"/>
    <text x="${width / 2}" y="21"
      font-family="-apple-system,BlinkMacSystemFont,sans-serif"
      font-size="13" font-weight="700" fill="#111827" text-anchor="middle">${text}</text>
  </svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export default function KakaoMap({
  restaurants,
  center = { lat: 35.1796, lng: 129.0756 },
  onMarkerClick
}: KakaoMapProps) {
  const markersRef = useRef<any[]>([])

  const initMap = () => {
    if (!window.kakao?.maps) return
    const container = document.getElementById('kakao-map')
    if (!container) return

    window.kakao.maps.load(() => {
      const map = new window.kakao.maps.Map(container, {
        center: new window.kakao.maps.LatLng(center.lat, center.lng),
        level: 6
      })

      const markers = restaurants.map((restaurant) => {
        const position = new window.kakao.maps.LatLng(restaurant.lat, restaurant.lng)
        const width = Math.max(64, `${restaurant.corkage_fee.toLocaleString()}원`.length * 8 + 28)
        const image = new window.kakao.maps.MarkerImage(
          makePriceSvg(restaurant.corkage_fee),
          new window.kakao.maps.Size(width, 32),
          { offset: new window.kakao.maps.Point(width / 2, 16) }
        )
        const marker = new window.kakao.maps.Marker({ position, image })

        window.kakao.maps.event.addListener(marker, 'click', () => {
          onMarkerClick?.(restaurant)
        })

        return marker
      })

      markersRef.current = markers

      new window.kakao.maps.MarkerClusterer({
        map,
        markers,
        averageCenter: true,
        minLevel: 5,
        styles: [
          {
            width: '44px',
            height: '44px',
            background: 'rgba(239, 68, 68, 0.85)',
            borderRadius: '50%',
            color: '#fff',
            textAlign: 'center',
            fontWeight: '700',
            lineHeight: '44px',
            fontSize: '15px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)'
          }
        ]
      })
    })
  }

  if (!process.env.NEXT_PUBLIC_KAKAO_MAP_KEY) {
    return (
      <div className="w-full h-full min-h-[400px] bg-muted flex items-center justify-center text-muted-foreground text-sm">
        카카오맵 API 키를 설정해주세요 (NEXT_PUBLIC_KAKAO_MAP_KEY)
      </div>
    )
  }

  return (
    <>
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false&libraries=clusterer`}
        onLoad={initMap}
      />
      <div id="kakao-map" className="w-full h-full min-h-[400px]" />
    </>
  )
}
