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
  const overlaysRef = useRef<any[]>([])

  const initMap = () => {
    if (!window.kakao?.maps) return

    const container = document.getElementById('kakao-map')
    if (!container) return

    window.kakao.maps.load(() => {
      const map = new window.kakao.maps.Map(container, {
        center: new window.kakao.maps.LatLng(center.lat, center.lng),
        level: 6
      })

      // 클러스터러용 투명 마커 이미지 (1×1 gif)
      const invisibleImage = new window.kakao.maps.MarkerImage(
        'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        new window.kakao.maps.Size(1, 1)
      )

      const overlays: any[] = []
      const markers = restaurants.map((restaurant) => {
        const position = new window.kakao.maps.LatLng(restaurant.lat, restaurant.lng)

        // 클러스터러에 넘길 투명 마커
        const marker = new window.kakao.maps.Marker({ position, image: invisibleImage })

        // 가격 뱃지 오버레이
        const el = document.createElement('div')
        el.textContent = `${restaurant.corkage_fee.toLocaleString()}원`
        Object.assign(el.style, {
          background: 'white',
          border: '2px solid #111827',
          borderRadius: '20px',
          padding: '5px 12px',
          fontSize: '13px',
          fontWeight: '700',
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
          userSelect: 'none',
        })

        el.addEventListener('click', () => onMarkerClick?.(restaurant))
        el.addEventListener('mouseover', () => {
          el.style.background = '#111827'
          el.style.color = 'white'
        })
        el.addEventListener('mouseout', () => {
          el.style.background = 'white'
          el.style.color = ''
        })

        const overlay = new window.kakao.maps.CustomOverlay({
          position,
          content: el,
          yAnchor: 1.4,
        })

        overlays.push(overlay)
        return marker
      })

      markersRef.current = markers
      overlaysRef.current = overlays

      const clusterer = new window.kakao.maps.MarkerClusterer({
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

      // 클러스터링 시작 전 모든 오버레이 숨김
      window.kakao.maps.event.addListener(clusterer, 'clusteringbegin', () => {
        overlays.forEach(o => o.setMap(null))
      })

      // 클러스터링 완료 후 단독 마커에만 오버레이 표시
      window.kakao.maps.event.addListener(clusterer, 'clusteringend', (target: any) => {
        const clusteredSet = new Set<any>()
        target.getClusters().forEach((cluster: any) => {
          if (cluster.getMarkers().length > 1) {
            cluster.getMarkers().forEach((m: any) => clusteredSet.add(m))
          }
        })

        markers.forEach((marker, i) => {
          overlays[i].setMap(clusteredSet.has(marker) ? null : map)
        })
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
