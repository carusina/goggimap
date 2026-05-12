export const dynamic = 'force-dynamic'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import MapWithSheet from '@/components/MapWithSheet'
import type { Restaurant } from '@/types'

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
    <div className="h-[calc(100vh-64px)]">
      <MapWithSheet restaurants={restaurants} />
    </div>
  )
}
