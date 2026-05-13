import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { restaurantId, reservedAt, partySize, items } = await req.json()

    if (!restaurantId || !reservedAt || !partySize || !items?.length) {
      return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 })
    }

    const { data: reservation, error: rError } = await supabase
      .from('reservations')
      .insert({
        customer_id: user.id,
        restaurant_id: restaurantId,
        reserved_at: reservedAt,
        party_size: partySize,
        status: 'pending',
      })
      .select('id')
      .single()

    if (rError) throw rError

    const { error: oError } = await supabase.from('order_items').insert(
      items.map((item: { productId: string; quantity: number; unitPrice: number }) => ({
        reservation_id: reservation.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      }))
    )

    if (oError) throw oError

    return NextResponse.json({ reservationId: reservation.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : '서버 오류'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
