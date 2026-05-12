import { createServerSupabaseClient } from '@/lib/supabase/server'
import RestaurantCard from '@/components/RestaurantCard'
import KakaoMap from '@/components/KakaoMap'
import type { Restaurant } from '@/types'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let restaurants: Restaurant[] = []

  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    restaurants = data ?? []
  } catch (e) {
    console.error('Failed to fetch restaurants:', e)
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)]">
      {/* 왼쪽: 가게 카드 목록 */}
      <div className="w-full lg:w-[400px] flex-shrink-0 overflow-y-auto border-r">
        <div className="p-4">
          <h2 className="text-base font-semibold mb-1">부산 콜키지 가게</h2>
          <p className="text-xs text-muted-foreground mb-4">
            {restaurants.length}개의 가게 · 직접 구매한 고기를 가져오세요
          </p>
          {restaurants.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              <p>가게 정보를 불러오는 중입니다.</p>
              <p className="mt-1 text-xs">Supabase 연결 및 시드 데이터를 확인해주세요.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 오른쪽: 카카오맵 */}
      <div className="flex-1 min-h-[300px]">
        <KakaoMap restaurants={restaurants} />
      </div>
    </div>
  )
}
