export const dynamic = 'force-dynamic'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, CheckCircle, Clock, MapPin, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { ReservationWithDetails } from '@/types'

const STATUS_LABEL: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending:   { label: '결제 대기', variant: 'secondary' },
  confirmed: { label: '예약 확정', variant: 'default' },
  cancelled: { label: '취소됨',   variant: 'destructive' },
}

interface PageProps {
  params: { id: string }
}

export default async function ReservationDetailPage({ params }: PageProps) {
  const supabase = createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      restaurants (*),
      order_items (
        *,
        meat_products (*)
      )
    `)
    .eq('id', params.id)
    .eq('customer_id', user.id)
    .single()

  if (error || !data) notFound()

  const r = data as unknown as ReservationWithDetails
  const status = STATUS_LABEL[r.status] ?? STATUS_LABEL.pending
  const reservedDate = new Date(r.reserved_at)

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      <Link
        href="/reservations"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="w-4 h-4" />
        내 예약 목록
      </Link>

      {r.status === 'confirmed' && (
        <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-950 rounded-xl p-4">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">예약이 확정되었습니다!</span>
        </div>
      )}

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">{r.restaurants.name}</h1>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span>{r.restaurants.address}</span>
        </div>
      </div>

      <Separator />

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span>
            {reservedDate.toLocaleDateString('ko-KR', {
              month: 'long',
              day: 'numeric',
            })}{' '}
            {reservedDate.toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span>{r.party_size}명</span>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <h3 className="font-semibold">주문 고기 (정육단)</h3>
        {r.order_items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>
              {item.meat_products.name} × {item.quantity} ({item.meat_products.unit})
            </span>
            <span className="font-medium">
              {(item.unit_price * item.quantity).toLocaleString()}원
            </span>
          </div>
        ))}
        <div className="border-t pt-2 flex justify-between font-semibold text-sm">
          <span>고기 결제 합계</span>
          <span>{r.payment_amount?.toLocaleString()}원</span>
        </div>
      </div>

      <div className="bg-muted rounded-xl p-4 text-sm text-muted-foreground">
        콜키지비({r.restaurants.corkage_fee.toLocaleString()}원/인)·주류는 방문 시 현장에서 별도 결제합니다.
      </div>
    </div>
  )
}
