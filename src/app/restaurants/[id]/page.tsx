export const dynamic = 'force-dynamic'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { MapPin, Users, Clock, ChevronLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Restaurant } from '@/types'

const AVAILABLE_TIMES = ['11:00', '12:00', '13:00', '14:00', '17:00', '18:00', '19:00', '20:00']

interface PageProps {
  params: { id: string }
}

export default async function RestaurantDetailPage({ params }: PageProps) {
  let restaurant: Restaurant | null = null

  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) throw error
    restaurant = data
  } catch {
    notFound()
  }

  if (!restaurant) notFound()

  const r = restaurant

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      <Link href="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="w-4 h-4" />
        목록으로
      </Link>

      {/* 이미지 */}
      {r.image_url && (
        <div className="w-full h-64 rounded-xl overflow-hidden bg-muted">
          <img src={r.image_url} alt={r.name} className="w-full h-full object-cover" />
        </div>
      )}

      {/* 헤더 */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-2xl font-bold">{r.name}</h1>
          <Badge variant="secondary" className="flex-shrink-0">콜키지 운영</Badge>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground text-sm">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span>{r.address}</span>
        </div>
      </div>

      <Separator />

      {/* 주요 정보 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-muted rounded-xl p-4 text-center">
          <div className="text-2xl font-bold">
            {r.corkage_fee.toLocaleString()}원
          </div>
          <div className="text-xs text-muted-foreground mt-1">1인 콜키지 비용</div>
        </div>
        <div className="bg-muted rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-1 text-2xl font-bold">
            <Users className="w-5 h-5" />
            <span>최대 {r.max_tables * 4}명</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">동시 수용 인원</div>
        </div>
      </div>

      {r.description && (
        <p className="text-sm text-muted-foreground leading-relaxed">{r.description}</p>
      )}

      <Separator />

      {/* 예약 가능 시간 */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <h3 className="font-semibold">예약 가능 시간</h3>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {AVAILABLE_TIMES.map((time) => (
            <button
              key={time}
              className="border rounded-lg p-2 text-center text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      <Button className="w-full" size="lg" disabled>
        예약하기 (2주차 구현 예정)
      </Button>
    </div>
  )
}
