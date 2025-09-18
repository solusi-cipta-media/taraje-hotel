import { Link } from 'react-router-dom'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Wifi, Tv, Snowflake, Bath, MapPin, Phone, Mail } from 'lucide-react'

export default function HalamanUtamaPage() {
  const { tipeKamar, currentUser } = useAppStore()
  const featuredRooms = tipeKamar.slice(0, 2)

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">
          Selamat Datang di Baru Taraje
        </h1>
        <p className="text-muted-foreground text-lg">
          Hotel modern dengan pelayanan terbaik untuk kenyamanan Anda
        </p>
        {!currentUser && (
          <div className="flex gap-3 justify-center">
            <Button asChild>
              <Link to="/paket">Lihat Paket</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/login">Masuk</Link>
            </Button>
          </div>
        )}
      </section>

      {/* Featured Rooms */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Kamar Unggulan</h2>
        <div className="grid gap-4">
          {featuredRooms.map((room) => (
            <Card key={room.id} className="overflow-hidden">
              <div className="aspect-video bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">Foto Kamar</span>
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{room.nama}</CardTitle>
                  <Badge variant="secondary">
                    Rp {room.harga.toLocaleString('id-ID')}/malam
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">{room.deskripsi}</p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {room.fasilitas.slice(0, 4).map((fasilitas, index) => (
                    <div key={index} className="flex items-center gap-1 text-xs text-muted-foreground">
                      {fasilitas === 'WiFi' && <Wifi className="h-3 w-3" />}
                      {fasilitas === 'TV' && <Tv className="h-3 w-3" />}
                      {fasilitas === 'AC' && <Snowflake className="h-3 w-3" />}
                      {fasilitas === 'Kamar Mandi Dalam' && <Bath className="h-3 w-3" />}
                      <span>{fasilitas}</span>
                    </div>
                  ))}
                </div>
                <Button asChild className="w-full">
                  <Link to={`/pesan/${room.id}`}>Pesan Sekarang</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link to="/paket">Lihat Semua Paket</Link>
        </Button>
      </section>

      {/* About Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Tentang Kami</h2>
        <Card>
          <CardContent className="p-6 space-y-4">
            <p className="text-muted-foreground">
              Hotel Baru Taraje adalah pilihan terbaik untuk menginap dengan 
              fasilitas modern dan pelayanan berkualitas. Kami berkomitmen 
              memberikan pengalaman menginap yang tak terlupakan.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>Rating 4.8/5</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>Lokasi Strategis</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Contact Info */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Kontak</h2>
        <div className="grid gap-3">
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-primary" />
            <span>+62 123 456 7890</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-primary" />
            <span>info@barutaraje.com</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-primary" />
            <span>Jl. Hotel Indah No. 123, Kota Wisata</span>
          </div>
        </div>
      </section>
    </div>
  )
}