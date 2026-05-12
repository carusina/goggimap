export type UserRole = 'customer' | 'owner'
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled'

export interface Profile {
  id: string
  name: string | null
  phone: string | null
  role: UserRole
  created_at: string
}

export interface Restaurant {
  id: string
  owner_id: string | null
  name: string
  address: string
  lat: number
  lng: number
  corkage_fee: number
  max_tables: number
  description: string | null
  image_url: string | null
  is_active: boolean
  created_at: string
}

export interface Reservation {
  id: string
  customer_id: string
  restaurant_id: string
  reserved_at: string
  party_size: number
  status: ReservationStatus
  payment_key: string | null
  payment_amount: number | null
  memo: string | null
  created_at: string
}
