'use client'

import { useState, useEffect } from 'react'
import Script from 'next/script'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'
import type { MeatProduct, Restaurant } from '@/types'

const AVAILABLE_TIMES = ['11:00', '12:00', '13:00', '14:00', '17:00', '18:00', '19:00', '20:00']

type Step = 'datetime' | 'meat' | 'confirm'

interface CartItem {
  product: MeatProduct
  quantity: number
}

function getAvailableDates() {
  const dates: Date[] = []
  const today = new Date()
  for (let i = 1; i <= 14; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    dates.push(d)
  }
  return dates
}

function toDateString(date: Date) {
  return date.toISOString().split('T')[0]
}

function formatDateLabel(date: Date) {
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return {
    date: `${date.getMonth() + 1}/${date.getDate()}`,
    day: days[date.getDay()],
  }
}

export default function ReservationFlow({
  restaurant,
  meatProducts,
}: {
  restaurant: Restaurant
  meatProducts: MeatProduct[]
}) {
  const [step, setStep] = useState<Step>('datetime')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [partySize, setPartySize] = useState(2)
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [tossReady, setTossReady] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const availableDates = getAvailableDates()
  const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
  }, [])

  function getQty(productId: string) {
    return cart.find((i) => i.product.id === productId)?.quantity ?? 0
  }

  function updateCart(product: MeatProduct, delta: number) {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (!existing) {
        return delta > 0 ? [...prev, { product, quantity: delta }] : prev
      }
      const newQty = existing.quantity + delta
      if (newQty <= 0) return prev.filter((i) => i.product.id !== product.id)
      return prev.map((i) => (i.product.id === product.id ? { ...i, quantity: newQty } : i))
    })
  }

  async function handlePayment() {
    if (!userId) {
      window.location.href = '/login'
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch('/api/reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          reservedAt: `${selectedDate}T${selectedTime}:00+09:00`,
          partySize,
          items: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: item.product.price,
          })),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? '예약 생성 실패')

      const { reservationId } = json
      const toss = (window as any).TossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!)
      const payment = toss.payment({ customerKey: userId })

      await payment.requestPayment({
        method: 'CARD',
        orderId: reservationId,
        orderName: `${restaurant.name} 정육단 고기 주문`,
        amount: { currency: 'KRW', value: totalAmount },
        successUrl: `${window.location.origin}/api/reservation/confirm`,
        failUrl: `${window.location.origin}/restaurants/${restaurant.id}`,
      })
    } catch (err: any) {
      alert(err.message)
      setIsLoading(false)
    }
  }

  if (step === 'datetime') {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="font-semibold">날짜 선택</h3>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {availableDates.map((date) => {
              const value = toDateString(date)
              const { date: d, day } = formatDateLabel(date)
              const selected = selectedDate === value
              return (
                <button
                  key={value}
                  onClick={() => setSelectedDate(value)}
                  className={`flex-shrink-0 flex flex-col items-center justify-center w-14 h-16 rounded-xl border text-sm font-medium transition-colors
                    ${selected ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'}`}
                >
                  <span className="text-xs">{day}</span>
                  <span>{d}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">시간 선택</h3>
          <div className="grid grid-cols-4 gap-2">
            {AVAILABLE_TIMES.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`border rounded-lg p-2 text-center text-sm transition-colors
                  ${selectedTime === time ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'}`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">인원</h3>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPartySize((p) => Math.max(1, p - 1))}
              className="w-9 h-9 rounded-full border flex items-center justify-center hover:bg-muted"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-xl font-semibold w-8 text-center">{partySize}</span>
            <button
              onClick={() => setPartySize((p) => Math.min(restaurant.max_tables * 4, p + 1))}
              className="w-9 h-9 rounded-full border flex items-center justify-center hover:bg-muted"
            >
              <Plus className="w-4 h-4" />
            </button>
            <span className="text-sm text-muted-foreground">명</span>
          </div>
        </div>

        <Button
          className="w-full"
          size="lg"
          disabled={!selectedDate || !selectedTime}
          onClick={() => setStep('meat')}
        >
          다음 — 고기 선택
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    )
  }

  if (step === 'meat') {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setStep('datetime')}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-4 h-4" />
          날짜/시간 변경
        </button>

        <div>
          <h3 className="font-semibold">고기 선택 (정육단)</h3>
          <p className="text-sm text-muted-foreground mt-1">
            주문한 고기는 식당에서 수령합니다. 콜키지비·주류는 현장 결제입니다.
          </p>
        </div>

        <div className="space-y-3">
          {meatProducts.map((product) => {
            const qty = getQty(product.id)
            return (
              <div key={product.id} className="flex items-center gap-3 p-3 border rounded-xl">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{product.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {product.unit}
                    {product.description && ` · ${product.description}`}
                  </div>
                  <div className="text-sm font-semibold mt-0.5">
                    {product.price.toLocaleString()}원
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => updateCart(product, -1)}
                    disabled={qty === 0}
                    className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-muted disabled:opacity-30"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center text-sm font-medium">{qty}</span>
                  <button
                    onClick={() => updateCart(product, 1)}
                    className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-muted"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <Button
          className="w-full"
          size="lg"
          disabled={totalItems === 0}
          onClick={() => setStep('confirm')}
        >
          다음 — 주문 확인 ({totalAmount.toLocaleString()}원)
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    )
  }

  return (
    <>
      <Script
        src="https://js.tosspayments.com/v2/standard"
        strategy="afterInteractive"
        onLoad={() => setTossReady(true)}
      />
      <div className="space-y-4">
        <button
          onClick={() => setStep('meat')}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-4 h-4" />
          고기 변경
        </button>

        <h3 className="font-semibold">주문 확인</h3>

        <div className="bg-muted rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">식당</span>
            <span className="font-medium">{restaurant.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">일시</span>
            <span className="font-medium">{selectedDate} {selectedTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">인원</span>
            <span className="font-medium">{partySize}명</span>
          </div>
        </div>

        <div className="space-y-2">
          {cart.map((item) => (
            <div key={item.product.id} className="flex justify-between text-sm">
              <span>
                {item.product.name} × {item.quantity} ({item.product.unit})
              </span>
              <span className="font-medium">
                {(item.product.price * item.quantity).toLocaleString()}원
              </span>
            </div>
          ))}
        </div>

        <Separator />

        <div className="flex justify-between font-semibold text-sm">
          <span>결제 금액 (고기값)</span>
          <span>{totalAmount.toLocaleString()}원</span>
        </div>

        <p className="text-xs text-muted-foreground">
          콜키지비({restaurant.corkage_fee.toLocaleString()}원/인)·주류는 방문 시 현장에서 별도 결제합니다.
        </p>

        <Button
          className="w-full"
          size="lg"
          disabled={isLoading || !tossReady}
          onClick={handlePayment}
        >
          {isLoading ? '처리 중...' : `${totalAmount.toLocaleString()}원 결제하기`}
        </Button>
      </div>
    </>
  )
}
