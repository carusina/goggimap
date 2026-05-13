export const dynamic = 'force-dynamic'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CalendarDays, Users, Store } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { ReservationWithDetails } from '@/types'

const STATUS_LABEL: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending:   { label: '결제 대기', variant: 'secondary' },
  confirmed: { label: '예약 확정', variant: 'default' },
  cancelled: { label: '취소됨',   variant: 'destructive' },
}

export default async function ReservationsPage() {
  let reservations: ReservationWithDetails[] = []

  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
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
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      reservations = (data as unknown as ReservationWithDetails[]) ?? []
    }
  } catch (e) {
    console.error('Failed to fetch reservations:', e)
  }

  if (reservations.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="py-16 space-y-4">
          <div className="text-5xl">🥩</div>
          <h2 className="text-lg font-semibold">예약 내역이 없습니다</h2>
          <p className="text-sm text-muted-foreground">콜키지 가게를 찾아 예약해보세요</p>
          <Link href="/">
            <Button>가게 찾기</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-4">
      <h1 className="text-xl font-bold">내 예약</h1>
      <div className="space-y-3">
        {reservations.map((r) => {
          const status = STATUS_LABEL[r.status] ?? STATUS_LABEL.pending
          const reservedDate = new Date(r.reserved_at)
          const meatSummary = r.order_items
            .map((item) => `${item.meat_products.name} ×${item.quantity}`)
            .join(', ')

          return (
            <Link key={r.id} href={`/reservations/${r.id}`}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold">{r.restaurants?.name}</span>
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5" />
                      <span>
                        {reservedDate.toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}{' '}
                        {reservedDate.toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>{r.party_size}명</span>
                    </div>
                  </div>
                  {meatSummary && (
                    <>
                      <Separator />
                      <div className="text-sm text-muted-foreground truncate">{meatSummary}</div>
                      {r.payment_amount && (
                        <div className="text-sm font-medium">
                          {r.payment_amount.toLocaleString()}원 결제
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
