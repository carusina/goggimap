export const dynamic = 'force-dynamic'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MapPin, Users, ChevronLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { MeatProduct, Restaurant } from '@/types'
import ReservationFlow from '@/components/ReservationFlow'

interface PageProps {
  params: { id: string }
}

export default async function RestaurantDetailPage({ params }: PageProps) {
  const supabase = createServerSupabaseClient()

  const [{ data: restaurant, error }, { data: meatProducts }] = await Promise.all([
    supabase.from('restaurants').select('*').eq('id', params.id).single(),
    supabase.from('meat_products').select('*').eq('is_available', true).order('price'),
  ])

  if (error || !restaurant) notFound()

  const r = restaurant as Restaurant

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      <Link
        href="/"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="w-4 h-4" />
        목록으로
      </Link>

      {r.image_url && (
        <div className="w-full h-64 rounded-xl overflow-hidden bg-muted">
          <img src={r.image_url} alt={r.name} className="w-full h-full object-cover" />
        </div>
      )}

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

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-muted rounded-xl p-4 text-center">
          <div className="text-2xl font-bold">{r.corkage_fee.toLocaleString()}원</div>
          <div className="text-xs text-muted-foreground mt-1">1인 콜키지 (현장 결제)</div>
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

      <ReservationFlow
        restaurant={r}
        meatProducts={(meatProducts ?? []) as MeatProduct[]}
      />
    </div>
  )
}
