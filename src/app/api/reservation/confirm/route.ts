import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const paymentKey = searchParams.get('paymentKey')
  const orderId = searchParams.get('orderId')   // = reservationId
  const amount = Number(searchParams.get('amount'))

  if (!paymentKey || !orderId || !amount) {
    return NextResponse.redirect(`${origin}/?error=invalid_params`)
  }

  try {
    const supabase = createServerSupabaseClient()

    // 서버에서 order_items 합계와 결제 금액 검증
    const { data: items, error: iError } = await supabase
      .from('order_items')
      .select('quantity, unit_price')
      .eq('reservation_id', orderId)

    if (iError) throw iError

    const expectedAmount = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0)
    if (expectedAmount !== amount) {
      return NextResponse.redirect(`${origin}/?error=amount_mismatch`)
    }

    if (!process.env.TOSS_SECRET_KEY) {
      throw new Error('TOSS_SECRET_KEY is missing.')
    }

    // 토스페이먼츠 결제 승인
    const tossRes = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.TOSS_SECRET_KEY}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    })

    if (!tossRes.ok) {
      const tossError = await tossRes.json()
      throw new Error(tossError.message ?? '결제 승인 실패')
    }

    // 예약 상태 confirmed로 업데이트
    const { error: uError } = await supabase
      .from('reservations')
      .update({ status: 'confirmed', payment_key: paymentKey, payment_amount: amount })
      .eq('id', orderId)

    if (uError) throw uError

    return NextResponse.redirect(`${origin}/reservations/${orderId}`)
  } catch (err) {
    console.error('Payment confirm error:', err instanceof Error ? err.message : err)
    return NextResponse.redirect(`${origin}/?error=payment_failed`)
  }
}
