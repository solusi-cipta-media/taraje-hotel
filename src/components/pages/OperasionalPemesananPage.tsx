import React, { useState, useMemo } from 'react'
import { Calendar, momentLocalizer, View } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CalendarIcon, Plus, User, CreditCard, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Set moment locale to Indonesian
moment.locale('id')

const localizer = momentLocalizer(moment)

// Custom styles for calendar
const calendarStyle = {
  height: 600,
}

// Event style function based on payment status
const eventStyleGetter = (event: any) => {
  let backgroundColor = '#94a3b8' // default gray
  
  switch (event.statusPembayaran) {
    case 'Belum Bayar':
      backgroundColor = '#ef4444' // red
      break
    case 'DP':
      backgroundColor = '#f59e0b' // yellow/orange
      break
    case 'Lunas':
      backgroundColor = '#10b981' // green
      break
  }
  
  return {
    style: {
      backgroundColor,
      borderRadius: '4px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block',
      fontSize: '12px',
      padding: '2px 4px'
    }
  }
}

export default function OperasionalPemesananPage() {
  const {
    pemesanan,
    tamu,
    kamar,
    tipeKamar,
    transaksi,
    currentUser,
    addPemesanan,
    updatePemesanan,
    cancelPemesanan,
    addTransaksi,
    getTransaksiByPemesanan,
    checkRoomAvailability,
    getAvailableRooms,
    calculateNights,
    calculateTotalCost,
    addTamu,
    generateTamuCode
  } = useAppStore()

  // State for modals and forms
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [filterTipeKamar, setFilterTipeKamar] = useState<string>('all')

  // Form state for new booking
  const [newBookingForm, setNewBookingForm] = useState({
    tamuId: '',
    tanggalCheckIn: '',
    tanggalCheckOut: '',
    kamarId: '',
    catatan: '',
    paymentOption: 'Bayar Nanti',
    paymentAmount: '',
    paymentMethod: 'Transfer Bank'
  })

  // Form state for new guest
  const [newGuestForm, setNewGuestForm] = useState({
    namaLengkap: '',
    email: '',
    telepon: '',
    tipeIdentitas: 'KTP',
    nomorIdentitas: '',
    alamat: '',
    catatan: ''
  })

  // Form state for payment
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    method: 'Transfer Bank',
    type: 'Pembayaran Parsial'
  })

  // Convert bookings to calendar events
  const calendarEvents = useMemo(() => {
    return pemesanan
      .filter(booking => {
        if (filterTipeKamar === 'all') return true
        const room = kamar.find(k => k.id === booking.kamarId)
        return room?.tipeKamarId === filterTipeKamar
      })
      .filter(booking => booking.statusPemesanan !== 'Cancelled')
      .map(booking => {
        const guest = tamu.find(t => t.id === booking.tamuId)
        const room = kamar.find(k => k.id === booking.kamarId)
        
        return {
          id: booking.id,
          title: `${room?.nomor || ''} - ${guest?.namaLengkap || 'Unknown'}`,
          start: new Date(booking.tanggalCheckIn),
          end: new Date(booking.tanggalCheckOut),
          resource: booking,
          statusPembayaran: booking.statusPembayaran
        }
      })
  }, [pemesanan, kamar, tamu, filterTipeKamar])

  // Handle calendar slot selection
  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedDate(start)
    setNewBookingForm(prev => ({
      ...prev,
      tanggalCheckIn: moment(start).format('YYYY-MM-DD'),
      tanggalCheckOut: moment(start).add(1, 'day').format('YYYY-MM-DD')
    }))
    setIsNewBookingOpen(true)
  }

  // Handle event selection
  const handleSelectEvent = (event: any) => {
    setSelectedBooking(event.resource)
    setIsDetailOpen(true)
  }

  // Calculate derived values for new booking
  const nights = useMemo(() => {
    if (newBookingForm.tanggalCheckIn && newBookingForm.tanggalCheckOut) {
      return calculateNights(newBookingForm.tanggalCheckIn, newBookingForm.tanggalCheckOut)
    }
    return 0
  }, [newBookingForm.tanggalCheckIn, newBookingForm.tanggalCheckOut, calculateNights])

  const totalCost = useMemo(() => {
    if (newBookingForm.kamarId && nights > 0) {
      return calculateTotalCost(newBookingForm.kamarId, nights)
    }
    return 0
  }, [newBookingForm.kamarId, nights, calculateTotalCost])

  // Get available rooms for selected dates
  const availableRooms = useMemo(() => {
    if (newBookingForm.tanggalCheckIn && newBookingForm.tanggalCheckOut) {
      return getAvailableRooms(
        newBookingForm.tanggalCheckIn,
        newBookingForm.tanggalCheckOut
      )
    }
    return []
  }, [newBookingForm.tanggalCheckIn, newBookingForm.tanggalCheckOut, getAvailableRooms])

  // Handle new guest form submission
  const handleAddGuest = () => {
    if (!newGuestForm.namaLengkap || !newGuestForm.email || !newGuestForm.telepon || !newGuestForm.nomorIdentitas) {
      toast.error('Mohon lengkapi semua field yang wajib diisi')
      return
    }

    // Check if email already exists
    const existingGuest = tamu.find(t => t.email === newGuestForm.email)
    if (existingGuest) {
      toast.error('Email ini sudah terdaftar. Silakan gunakan email lain.')
      return
    }

    try {
      addTamu(newGuestForm as any)
      
      // Find the newly added guest
      const newGuest = tamu.find(t => t.email === newGuestForm.email)
      if (newGuest) {
        setNewBookingForm(prev => ({ ...prev, tamuId: newGuest.id }))
      }
      
      setNewGuestForm({
        namaLengkap: '',
        email: '',
        telepon: '',
        tipeIdentitas: 'KTP',
        nomorIdentitas: '',
        alamat: '',
        catatan: ''
      })
      setIsAddGuestOpen(false)
      toast.success(`Tamu "${newGuestForm.namaLengkap}" berhasil ditambahkan`)
    } catch (error) {
      toast.error('Gagal menambahkan tamu baru')
    }
  }

  // Handle new booking submission
  const handleCreateBooking = () => {
    if (!newBookingForm.tamuId || !newBookingForm.kamarId || !newBookingForm.tanggalCheckIn || !newBookingForm.tanggalCheckOut) {
      toast.error('Mohon lengkapi semua field yang wajib diisi')
      return
    }

    if (nights <= 0) {
      toast.error('Tanggal check-out harus setelah tanggal check-in')
      return
    }

    if (!checkRoomAvailability(newBookingForm.kamarId, newBookingForm.tanggalCheckIn, newBookingForm.tanggalCheckOut)) {
      toast.error('Kamar tidak tersedia pada tanggal tersebut')
      return
    }

    try {
      const bookingData: any = {
        tamuId: newBookingForm.tamuId,
        kamarId: newBookingForm.kamarId,
        tanggalCheckIn: newBookingForm.tanggalCheckIn,
        tanggalCheckOut: newBookingForm.tanggalCheckOut,
        jumlahMalam: nights,
        totalBiaya: totalCost,
        totalTerbayar: 0,
        sisaPembayaran: totalCost,
        statusPembayaran: 'Belum Bayar' as const,
        statusPemesanan: 'Confirmed' as const,
        catatan: newBookingForm.catatan
      }

      // Handle payment
      let paymentAmount = 0
      if (newBookingForm.paymentOption === 'Bayar DP' || newBookingForm.paymentOption === 'Bayar Lunas') {
        paymentAmount = parseInt(newBookingForm.paymentAmount) || 0
        if (paymentAmount <= 0) {
          toast.error('Jumlah pembayaran harus lebih dari 0')
          return
        }
        if (newBookingForm.paymentOption === 'Bayar Lunas' && paymentAmount < totalCost) {
          toast.error('Jumlah pembayaran lunas harus sama dengan total biaya')
          return
        }
      }

      bookingData.totalTerbayar = paymentAmount
      bookingData.sisaPembayaran = totalCost - paymentAmount
      
      if (paymentAmount === 0) {
        bookingData.statusPembayaran = 'Belum Bayar'
      } else if (paymentAmount >= totalCost) {
        bookingData.statusPembayaran = 'Lunas'
      } else {
        bookingData.statusPembayaran = 'DP'
      }

      const bookingId = addPemesanan(bookingData)

      // Add transaction if payment was made
      if (paymentAmount > 0) {
        addTransaksi({
          pemesananId: bookingId,
          tanggal: new Date().toISOString().split('T')[0],
          jenis: paymentAmount >= totalCost ? 'Pelunasan' : 'Uang Muka',
          jumlah: paymentAmount,
          metode: newBookingForm.paymentMethod as any
        })
      }

      // Reset form
      setNewBookingForm({
        tamuId: '',
        tanggalCheckIn: '',
        tanggalCheckOut: '',
        kamarId: '',
        catatan: '',
        paymentOption: 'Bayar Nanti',
        paymentAmount: '',
        paymentMethod: 'Transfer Bank'
      })
      setIsNewBookingOpen(false)
      
      const guest = tamu.find(t => t.id === bookingData.tamuId)
      toast.success(`Pemesanan untuk "${guest?.namaLengkap}" berhasil dibuat`)
    } catch (error) {
      toast.error('Gagal membuat pemesanan')
    }
  }

  // Handle payment addition
  const handleAddPayment = () => {
    if (!selectedBooking || !paymentForm.amount) {
      toast.error('Mohon lengkapi jumlah pembayaran')
      return
    }

    const amount = parseInt(paymentForm.amount)
    if (amount <= 0 || amount > selectedBooking.sisaPembayaran) {
      toast.error('Jumlah pembayaran tidak valid')
      return
    }

    try {
      addTransaksi({
        pemesananId: selectedBooking.id,
        tanggal: new Date().toISOString().split('T')[0],
        jenis: paymentForm.type as any,
        jumlah: amount,
        metode: paymentForm.method as any
      })

      const newTotalTerbayar = selectedBooking.totalTerbayar + amount
      const newSisaPembayaran = selectedBooking.sisaPembayaran - amount
      const newStatusPembayaran = newSisaPembayaran <= 0 ? 'Lunas' : 'DP'

      updatePemesanan(selectedBooking.id, {
        totalTerbayar: newTotalTerbayar,
        sisaPembayaran: newSisaPembayaran,
        statusPembayaran: newStatusPembayaran
      })

      setPaymentForm({
        amount: '',
        method: 'Transfer Bank',
        type: 'Pembayaran Parsial'
      })
      setIsPaymentOpen(false)
      toast.success('Pembayaran berhasil ditambahkan')
    } catch (error) {
      toast.error('Gagal menambahkan pembayaran')
    }
  }

  // Handle booking status change
  const handleStatusChange = (status: string) => {
    if (!selectedBooking) return

    try {
      if (status === 'Cancelled') {
        cancelPemesanan(selectedBooking.id)
        setIsDetailOpen(false)
        toast.success('Pemesanan berhasil dibatalkan')
      } else {
        updatePemesanan(selectedBooking.id, {
          statusPemesanan: status as any
        })
        toast.success(`Status pemesanan berhasil diubah ke ${status}`)
      }
    } catch (error) {
      toast.error('Gagal mengubah status pemesanan')
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Kalender Pemesanan
        </CardTitle>
        
        {/* Filter Section */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="filter-tipe">Filter Tipe Kamar:</Label>
            <Select value={filterTipeKamar} onValueChange={setFilterTipeKamar}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                {tipeKamar.map((tipe) => (
                  <SelectItem key={tipe.id} value={tipe.id}>
                    {tipe.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm">Belum Bayar</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-sm">DP</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm">Lunas</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Calendar */}
        <div className="border rounded-lg p-4">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={calendarStyle}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            eventPropGetter={eventStyleGetter}
            defaultView="month"
            views={['month', 'week', 'day']}
            popup
            messages={{
              next: 'Berikutnya',
              previous: 'Sebelumnya',
              today: 'Hari Ini',
              month: 'Bulan',
              week: 'Minggu',
              day: 'Hari',
              agenda: 'Agenda',
              date: 'Tanggal',
              time: 'Waktu',
              event: 'Acara',
              noEventsInRange: 'Tidak ada pemesanan dalam rentang ini.',
              showMore: (total) => `+${total} lainnya`
            }}
          />
        </div>

        {/* New Booking Modal */}
        <Dialog open={isNewBookingOpen} onOpenChange={setIsNewBookingOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Buat Pemesanan Baru</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Guest Selection */}
              <div className="space-y-2">
                <Label>Data Tamu *</Label>
                <div className="flex gap-2">
                  <Select value={newBookingForm.tamuId} onValueChange={(value) => setNewBookingForm(prev => ({ ...prev, tamuId: value }))}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Cari atau Pilih Tamu" />
                    </SelectTrigger>
                    <SelectContent>
                      {tamu.map((guest) => (
                        <SelectItem key={guest.id} value={guest.id}>
                          {guest.namaLengkap} - {guest.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog open={isAddGuestOpen} onOpenChange={setIsAddGuestOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4" />
                        Tambah Tamu
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Tambah Tamu Baru</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Nama Lengkap *</Label>
                          <Input 
                            value={newGuestForm.namaLengkap}
                            onChange={(e) => setNewGuestForm(prev => ({ ...prev, namaLengkap: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label>Email *</Label>
                          <Input 
                            type="email"
                            value={newGuestForm.email}
                            onChange={(e) => setNewGuestForm(prev => ({ ...prev, email: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label>Nomor Telepon *</Label>
                          <Input 
                            value={newGuestForm.telepon}
                            onChange={(e) => setNewGuestForm(prev => ({ ...prev, telepon: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label>Tipe Identitas *</Label>
                          <Select value={newGuestForm.tipeIdentitas} onValueChange={(value) => setNewGuestForm(prev => ({ ...prev, tipeIdentitas: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="KTP">KTP</SelectItem>
                              <SelectItem value="SIM">SIM</SelectItem>
                              <SelectItem value="Paspor">Paspor</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Nomor Identitas *</Label>
                          <Input 
                            value={newGuestForm.nomorIdentitas}
                            onChange={(e) => setNewGuestForm(prev => ({ ...prev, nomorIdentitas: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label>Alamat</Label>
                          <Textarea 
                            value={newGuestForm.alamat}
                            onChange={(e) => setNewGuestForm(prev => ({ ...prev, alamat: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label>Catatan Internal</Label>
                          <Textarea 
                            value={newGuestForm.catatan}
                            onChange={(e) => setNewGuestForm(prev => ({ ...prev, catatan: e.target.value }))}
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" onClick={() => setIsAddGuestOpen(false)}>
                            Batal
                          </Button>
                          <Button onClick={handleAddGuest}>
                            Simpan Tamu
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Date Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tanggal Check-in *</Label>
                  <Input 
                    type="date"
                    value={newBookingForm.tanggalCheckIn}
                    onChange={(e) => setNewBookingForm(prev => ({ ...prev, tanggalCheckIn: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Tanggal Check-out *</Label>
                  <Input 
                    type="date"
                    value={newBookingForm.tanggalCheckOut}
                    onChange={(e) => setNewBookingForm(prev => ({ ...prev, tanggalCheckOut: e.target.value }))}
                  />
                </div>
              </div>

              {/* Calculated nights */}
              {nights > 0 && (
                <div>
                  <Label>Jumlah Malam</Label>
                  <Input value={`${nights} malam`} disabled />
                </div>
              )}

              {/* Room Selection */}
              <div>
                <Label>Pilih Kamar *</Label>
                {availableRooms.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Tidak ada kamar yang tersedia pada tanggal tersebut.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Select value={newBookingForm.kamarId} onValueChange={(value) => setNewBookingForm(prev => ({ ...prev, kamarId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kamar tersedia" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRooms.map((room) => {
                        const roomType = tipeKamar.find(tk => tk.id === room.tipeKamarId)
                        return (
                          <SelectItem key={room.id} value={room.id}>
                            {room.nomor} - {roomType?.nama} ({formatCurrency(roomType?.hargaDefault || 0)})
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Cost Summary */}
              {totalCost > 0 && (
                <div className="p-4 bg-muted rounded-lg">
                  <Label className="text-sm font-medium">Total Biaya</Label>
                  <div className="text-lg font-bold">{formatCurrency(totalCost)}</div>
                  <div className="text-sm text-muted-foreground">
                    {nights} malam × {formatCurrency(totalCost / nights)}
                  </div>
                </div>
              )}

              {/* Payment Options */}
              <div className="space-y-4">
                <Label>Opsi Pembayaran</Label>
                <Select value={newBookingForm.paymentOption} onValueChange={(value) => setNewBookingForm(prev => ({ ...prev, paymentOption: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bayar Nanti">Bayar Nanti</SelectItem>
                    <SelectItem value="Bayar DP">Bayar Uang Muka (DP)</SelectItem>
                    <SelectItem value="Bayar Lunas">Bayar Lunas</SelectItem>
                  </SelectContent>
                </Select>

                {(newBookingForm.paymentOption === 'Bayar DP' || newBookingForm.paymentOption === 'Bayar Lunas') && (
                  <div className="space-y-4">
                    <div>
                      <Label>Jumlah Pembayaran</Label>
                      <Input 
                        type="number"
                        placeholder={newBookingForm.paymentOption === 'Bayar Lunas' ? totalCost.toString() : ''}
                        value={newBookingForm.paymentAmount}
                        onChange={(e) => setNewBookingForm(prev => ({ ...prev, paymentAmount: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Metode Pembayaran</Label>
                      <Select value={newBookingForm.paymentMethod} onValueChange={(value) => setNewBookingForm(prev => ({ ...prev, paymentMethod: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Transfer Bank">Transfer Bank</SelectItem>
                          <SelectItem value="Kartu Kredit">Kartu Kredit</SelectItem>
                          <SelectItem value="Tunai">Tunai</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <Label>Catatan Tambahan</Label>
                <Textarea 
                  placeholder="Permintaan khusus dari tamu..."
                  value={newBookingForm.catatan}
                  onChange={(e) => setNewBookingForm(prev => ({ ...prev, catatan: e.target.value }))}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsNewBookingOpen(false)}>
                  Batal
                </Button>
                <Button 
                  onClick={handleCreateBooking}
                  disabled={!newBookingForm.tamuId || !newBookingForm.kamarId || availableRooms.length === 0}
                >
                  Simpan Pemesanan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Booking Detail Modal */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detail Pemesanan</DialogTitle>
            </DialogHeader>
            
            {selectedBooking && (
              <div className="space-y-6">
                {/* Booking Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Kode Booking</Label>
                    <div className="font-medium">{selectedBooking.kodeBooking}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Status</Label>
                    <div className="flex gap-2">
                      <Badge variant={selectedBooking.statusPemesanan === 'Confirmed' ? 'default' : 'secondary'}>
                        {selectedBooking.statusPemesanan}
                      </Badge>
                      <Badge variant={
                        selectedBooking.statusPembayaran === 'Lunas' ? 'success' :
                        selectedBooking.statusPembayaran === 'DP' ? 'warning' : 'destructive'
                      } as any>
                        {selectedBooking.statusPembayaran}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Guest Info */}
                <div>
                  <Label className="text-sm text-muted-foreground">Tamu</Label>
                  {(() => {
                    const guest = tamu.find(t => t.id === selectedBooking.tamuId)
                    return guest ? (
                      <div className="font-medium">
                        {guest.namaLengkap}
                        <div className="text-sm text-muted-foreground">{guest.email} • {guest.telepon}</div>
                      </div>
                    ) : 'Data tamu tidak ditemukan'
                  })()}
                </div>

                {/* Room Info */}
                <div>
                  <Label className="text-sm text-muted-foreground">Kamar</Label>
                  {(() => {
                    const room = kamar.find(k => k.id === selectedBooking.kamarId)
                    const roomType = room ? tipeKamar.find(tk => tk.id === room.tipeKamarId) : null
                    return room && roomType ? (
                      <div className="font-medium">
                        {room.nomor} - {roomType.nama}
                        <div className="text-sm text-muted-foreground">{formatCurrency(roomType.hargaDefault)} per malam</div>
                      </div>
                    ) : 'Data kamar tidak ditemukan'
                  })()}
                </div>

                {/* Date Info */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Check-in</Label>
                    <div className="font-medium">{moment(selectedBooking.tanggalCheckIn).format('DD MMM YYYY')}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Check-out</Label>
                    <div className="font-medium">{moment(selectedBooking.tanggalCheckOut).format('DD MMM YYYY')}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Jumlah Malam</Label>
                    <div className="font-medium">{selectedBooking.jumlahMalam} malam</div>
                  </div>
                </div>

                <Separator />

                {/* Payment Info */}
                <div className="space-y-4">
                  <Label className="text-sm text-muted-foreground">Rincian Pembayaran</Label>
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span>Total Biaya:</span>
                      <span className="font-medium">{formatCurrency(selectedBooking.totalBiaya)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Terbayar:</span>
                      <span className="font-medium text-green-600">{formatCurrency(selectedBooking.totalTerbayar)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sisa Pembayaran:</span>
                      <span className="font-medium text-red-600">{formatCurrency(selectedBooking.sisaPembayaran)}</span>
                    </div>
                  </div>
                </div>

                {/* Transaction History */}
                <div className="space-y-4">
                  <Label className="text-sm text-muted-foreground">Riwayat Pembayaran</Label>
                  <ScrollArea className="h-32">
                    {(() => {
                      const transactions = getTransaksiByPemesanan(selectedBooking.id)
                      return transactions.length > 0 ? (
                        <div className="space-y-2">
                          {transactions.map((transaction) => (
                            <div key={transaction.id} className="flex justify-between items-center p-2 border rounded">
                              <div>
                                <div className="font-medium">{transaction.jenis}</div>
                                <div className="text-sm text-muted-foreground">
                                  {moment(transaction.tanggal).format('DD MMM YYYY')} • {transaction.metode}
                                </div>
                              </div>
                              <div className="font-medium">{formatCurrency(transaction.jumlah)}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">Belum ada pembayaran</div>
                      )
                    })()}
                  </ScrollArea>
                </div>

                {/* Notes */}
                {selectedBooking.catatan && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Catatan</Label>
                    <div className="p-3 bg-muted rounded-lg">{selectedBooking.catatan}</div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 justify-end">
                  {selectedBooking.sisaPembayaran > 0 && (
                    <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Tambah Pembayaran
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Tambah Pembayaran</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Sisa Pembayaran</Label>
                            <div className="font-bold text-lg">{formatCurrency(selectedBooking.sisaPembayaran)}</div>
                          </div>
                          <div>
                            <Label>Jumlah Pembayaran</Label>
                            <Input 
                              type="number"
                              max={selectedBooking.sisaPembayaran}
                              value={paymentForm.amount}
                              onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label>Metode Pembayaran</Label>
                            <Select value={paymentForm.method} onValueChange={(value) => setPaymentForm(prev => ({ ...prev, method: value }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Transfer Bank">Transfer Bank</SelectItem>
                                <SelectItem value="Kartu Kredit">Kartu Kredit</SelectItem>
                                <SelectItem value="Tunai">Tunai</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>
                              Batal
                            </Button>
                            <Button onClick={handleAddPayment}>
                              Simpan Pembayaran
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                  
                  <Select onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Ubah Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Confirmed">Confirmed</SelectItem>
                      <SelectItem value="Checked-in">Checked-in</SelectItem>
                      <SelectItem value="Checked-out">Checked-out</SelectItem>
                      <SelectItem value="Cancelled">
                        <span className="text-red-600">Cancelled</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                    Tutup
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}