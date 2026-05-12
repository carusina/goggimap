import Link from 'next/link'
import { MapPin, Users } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Restaurant } from '@/types'

interface RestaurantCardProps {
  restaurant: Restaurant
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Link href={`/restaurants/${restaurant.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        {restaurant.image_url && (
          <div className="w-full h-40 overflow-hidden rounded-t-lg bg-muted">
            <img
              src={restaurant.image_url}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base">{restaurant.name}</h3>
            <Badge variant="outline" className="text-xs">콜키지</Badge>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{restaurant.address}</span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-primary">
              {restaurant.corkage_fee.toLocaleString()}원/인
            </span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              <span>최대 {restaurant.max_tables * 4}명</span>
            </div>
          </div>
          {restaurant.description && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
              {restaurant.description}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
