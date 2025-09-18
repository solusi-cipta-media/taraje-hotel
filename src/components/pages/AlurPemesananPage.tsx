import { useState } from 'react'
import { useParams, Navigate, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, DollarSign, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function AlurPemesananPage() {
  const { tipeKamarId } = useParams()
  const { currentUser, tipeKamar, addPemesanan } = useAppStore()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    tanggalCheckIn: '',
    tanggalCheckOut: '',
    jumlahTamu: 1
  })
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if not logged in
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  const selectedRoom = tipeKamar.find(room => room.id === tipeKamarId)
  
  if (!selectedRoom) {
    return (
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Kamar Tidak Ditemukan</h1>
        <p className="text-muted-foreground">Kamar yang Anda pilih tidak tersedia.</p>
        <Button onClick={() => navigate('/paket')}>Kembali ke Paket</Button>
      </div>
    )
  }

  const calculateDays = () => {
    if (!formData.tanggalCheckIn || !formData.tanggalCheckOut) return 0
    const checkIn = new Date(formData.tanggalCheckIn)
    const checkOut = new Date(formData.tanggalCheckOut)
    const diffTime = checkOut.getTime() - checkIn.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const totalHarga = calculateDays() * selectedRoom.harga

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const days = calculateDays()
      if (days <= 0) {
        toast.error('Tanggal check-out harus setelah check-in')
        return
      }

      if (formData.jumlahTamu > selectedRoom.kapasitas) {
        toast.error(`Jumlah tamu melebihi kapasitas kamar (${selectedRoom.kapasitas} orang)`)
        return
      }

      // Create booking
      addPemesanan({
        customerId: currentUser.id,
        tamuId: currentUser.id, // Using customer as guest for now
        tipeKamarId: selectedRoom.id,
        kamarId: '1', // Placeholder - should be selected available room
        tanggalCheckIn: formData.tanggalCheckIn,
        tanggalCheckOut: formData.tanggalCheckOut,
        totalHarga,
        status: 'Pending'
      })

      toast.success('Pemesanan berhasil dibuat!')
      navigate('/akun/pesanan-saya')
    } catch (error) {
      toast.error('Gagal membuat pemesanan')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Pemesanan Kamar</h1>
        <p className="text-muted-foreground">
          Lengkapi data pemesanan Anda
        </p>
      </div>

      {/* Room Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>{selectedRoom.nama}</span>
            <Badge variant="secondary">
              Rp {selectedRoom.harga.toLocaleString('id-ID')}/malam
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{selectedRoom.deskripsi}</p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Kapasitas: {selectedRoom.kapasitas} orang</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Form */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Pemesanan</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tanggalCheckIn">Tanggal Check-in</Label>
                <Input
                  id="tanggalCheckIn"
                  name="tanggalCheckIn"
                  type="date"
                  value={formData.tanggalCheckIn}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tanggalCheckOut">Tanggal Check-out</Label>
                <Input
                  id="tanggalCheckOut"
                  name="tanggalCheckOut"
                  type="date"
                  value={formData.tanggalCheckOut}
                  onChange={handleChange}
                  min={formData.tanggalCheckIn || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jumlahTamu">Jumlah Tamu</Label>
              <Input
                id="jumlahTamu"
                name="jumlahTamu"
                type="number"
                min="1"
                max={selectedRoom.kapasitas}
                value={formData.jumlahTamu}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  jumlahTamu: parseInt(e.target.value) || 1
                }))}
                required
              />
            </div>

            {/* Price Summary */}
            {calculateDays() > 0 && (
              <Card className="bg-muted/50">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {calculateDays()} malam
                    </span>
                    <span>Rp {(calculateDays() * selectedRoom.harga).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center font-semibold text-lg border-t pt-2">
                    <span className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Total
                    </span>
                    <span>Rp {totalHarga.toLocaleString('id-ID')}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button type="submit" className="w-full" disabled={isLoading || calculateDays() <= 0}>
              <CheckCircle className="h-4 w-4 mr-2" />
              {isLoading ? 'Memproses...' : 'Konfirmasi Pemesanan'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}