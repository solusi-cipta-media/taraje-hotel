import { Link, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users } from 'lucide-react'
import type { TipeKamar } from '@/lib/store'

interface PackageCardProps {
  room: TipeKamar
  showFullDetails?: boolean
}

export function PackageCard({ room, showFullDetails = false }: PackageCardProps) {
  const { currentUser } = useAppStore()
  const navigate = useNavigate()
  
  const handleBookingClick = () => {
    // If user is not logged in, redirect to login
    if (!currentUser) {
      navigate('/login')
    } else {
      // If logged in, redirect to booking flow (will be implemented in next phase)
      navigate(`/pesan/${room.id}`)
    }
  }

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      {/* Room Image */}
      <div className="aspect-video relative overflow-hidden">
        <img 
          src={room.fotoUrl} 
          alt={room.nama}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            // Fallback if image fails to load
            e.currentTarget.src = 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400'
          }}
        />
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
            Rp {room.hargaDefault.toLocaleString('id-ID')}
          </Badge>
        </div>
      </div>

      {/* Room Info */}
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{room.nama}</CardTitle>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {room.deskripsi}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Capacity */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{room.kapasitas} Tamu</span>
        </div>

        {/* Price & Booking */}
        <div className="space-y-3">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Mulai dari</p>
            <p className="text-xl font-bold text-primary">
              Rp {room.hargaDefault.toLocaleString('id-ID')}
              <span className="text-sm font-normal text-muted-foreground"> / malam</span>
            </p>
          </div>
          
          <Button onClick={handleBookingClick} className="w-full">
            Pesan Sekarang
          </Button>
        </div>

        {/* Additional facilities if showFullDetails */}
        {showFullDetails && room.fasilitas && room.fasilitas.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Fasilitas:</h4>
            <div className="grid grid-cols-2 gap-2">
              {room.fasilitas.slice(0, 6).map((facility, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>{facility}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}