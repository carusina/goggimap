'use client'

import { useState } from 'react'
import { List, X, MapPin, Users, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import KakaoMap from '@/components/KakaoMap'
import RestaurantCard from '@/components/RestaurantCard'
import type { Restaurant } from '@/types'

interface MapWithSheetProps {
  restaurants: Restaurant[]
}

export default function MapWithSheet({ restaurants }: MapWithSheetProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selected, setSelected] = useState<Restaurant | null>(null)

  const handleMarkerClick = (restaurant: Restaurant) => {
    setSelected(restaurant)
    setSheetOpen(false)
  }

  return (
    <div className="h-full flex">
      {/* 데스크탑: 왼쪽 카드 패널 */}
      <div className="hidden lg:flex lg:w-[400px] flex-col flex-shrink-0 border-r overflow-y-auto">
        <div className="p-4">
          <h2 className="text-base font-semibold mb-1">부산 콜키지 가게</h2>
          <p className="text-xs text-muted-foreground mb-4">
            {restaurants.length}개의 가게 · 직접 구매한 고기를 가져오세요
          </p>
          <div className="space-y-3">
            {restaurants.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        </div>
      </div>

      {/* 지도 영역 */}
      <div className="flex-1 relative h-full">
        <KakaoMap
          restaurants={restaurants}
          onMarkerClick={handleMarkerClick}
        />

        {/* 모바일: 마커 클릭 시 미니 카드 */}
        {selected && !sheetOpen && (
          <div className="absolute bottom-20 left-3 right-3 lg:hidden z-10">
            <div className="bg-background rounded-2xl shadow-xl p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{selected.name}</div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {selected.corkage_fee.toLocaleString()}원/인
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Users className="w-3 h-3" />
                    최대 {selected.max_tables * 4}명
                  </span>
                </div>
                <div className="flex items-center gap-0.5 mt-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{selected.address}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Link href={`/restaurants/${selected.id}`}>
                  <div className="bg-primary text-primary-foreground rounded-xl px-3 py-2 text-xs font-medium flex items-center gap-1">
                    상세보기
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </Link>
                <button
                  onClick={() => setSelected(null)}
                  className="p-1.5 rounded-lg hover:bg-muted"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 모바일: 목록 보기 버튼 */}
        {!sheetOpen && (
          <button
            className="absolute bottom-6 left-1/2 -translate-x-1/2 lg:hidden bg-foreground text-background rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg flex items-center gap-2 z-10"
            onClick={() => { setSheetOpen(true); setSelected(null) }}
          >
            <List className="w-4 h-4" />
            목록 보기 ({restaurants.length})
          </button>
        )}

        {/* 모바일: 바텀시트 백드롭 */}
        {sheetOpen && (
          <div
            className="absolute inset-0 bg-black/30 lg:hidden z-20"
            onClick={() => setSheetOpen(false)}
          />
        )}

        {/* 모바일: 바텀시트 */}
        <div
          className={`absolute inset-x-0 bottom-0 lg:hidden bg-background rounded-t-2xl shadow-2xl z-30 transition-transform duration-300 ease-out ${
            sheetOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
          style={{ maxHeight: '72vh' }}
        >
          <div className="flex flex-col items-center pt-3 pb-2 px-4">
            <div className="w-10 h-1 rounded-full bg-border mb-3" />
            <div className="w-full flex items-center justify-between">
              <span className="font-semibold">콜키지 가게 {restaurants.length}곳</span>
              <button
                onClick={() => setSheetOpen(false)}
                className="p-1 rounded-lg hover:bg-muted"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>
          <div
            className="overflow-y-auto px-4 pb-8 space-y-3"
            style={{ maxHeight: 'calc(72vh - 72px)' }}
          >
            {restaurants.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
