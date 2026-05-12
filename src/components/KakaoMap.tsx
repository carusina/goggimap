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
        const marker = new window.kakao.maps.Marker({ position })

        const infowindow = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:6px 10px;font-size:13px;font-weight:600;white-space:nowrap;">${restaurant.name}</div>`
        })

        window.kakao.maps.event.addListener(marker, 'mouseover', () => {
          infowindow.open(map, marker)
        })
        window.kakao.maps.event.addListener(marker, 'mouseout', () => {
          infowindow.close()
        })
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
