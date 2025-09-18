import { Link } from 'react-router-dom'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Wifi, Tv, Snowflake, Bath, Users } from 'lucide-react'

export default function GaleriPaketPage() {
  const { tipeKamar } = useAppStore()

  const getFacilityIcon = (facility: string) => {
    switch (facility) {
      case 'WiFi': return <Wifi className="h-4 w-4" />
      case 'TV': return <Tv className="h-4 w-4" />
      case 'AC': return <Snowflake className="h-4 w-4" />
      case 'Kamar Mandi Dalam': return <Bath className="h-4 w-4" />
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Paket Kamar</h1>
        <p className="text-muted-foreground">
          Pilih paket kamar yang sesuai dengan kebutuhan Anda
        </p>
      </div>

      <div className="grid gap-6">
        {tipeKamar.map((room) => (
          <Card key={room.id} className="overflow-hidden">
            <div className="aspect-video bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">Foto {room.nama}</span>
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{room.nama}</CardTitle>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  Rp {room.harga.toLocaleString('id-ID')}
                </Badge>
              </div>
              <p className="text-muted-foreground">{room.deskripsi}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Kapasitas: {room.kapasitas} orang</span>
              </div>

              <div>
                <h4 className="font-medium mb-2">Fasilitas:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {room.fasilitas.map((facility, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      {getFacilityIcon(facility)}
                      <span>{facility}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Button asChild className="w-full">
                  <Link to={`/pesan/${room.id}`}>Pesan Kamar Ini</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tipeKamar.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Belum ada paket kamar tersedia saat ini.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}