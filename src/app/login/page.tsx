'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    setLoading(false)
  }

  const handleKakaoLogin = async () => {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    setLoading(false)
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-2 pb-4">
          <div className="text-4xl">🥩</div>
          <h1 className="text-2xl font-bold">고기맵</h1>
          <p className="text-sm text-muted-foreground">
            로그인하고 콜키지 예약을 시작하세요
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            className="w-full bg-[#FEE500] text-[#000000] hover:bg-[#FDD800]"
            onClick={handleKakaoLogin}
            disabled={loading}
          >
            카카오로 로그인
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            구글로 로그인
          </Button>
          <p className="text-xs text-center text-muted-foreground pt-2">
            로그인 시 이용약관 및 개인정보처리방침에 동의하는 것으로 간주됩니다.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
