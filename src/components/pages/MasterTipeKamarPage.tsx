import { useState, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Bed,
  Users,
  Image
} from 'lucide-react'
import { toast } from 'sonner'

interface TipeKamarFormData {
  nama: string
  deskripsi: string
  hargaDefault: string
  kapasitas: string
  fotoUrl: string
}

export default function MasterTipeKamarPage() {
  const { 
    tipeKamar, 
    currentUser, 
    addTipeKamar, 
    updateTipeKamar, 
    deleteTipeKamar,
    generateTipeKamarCode,
    canDeleteTipeKamar
  } = useAppStore()

  // Access control - hanya Admin yang bisa akses halaman ini
  if (!currentUser) {
    return <Navigate to="/dashboard" replace />
  }
  
  if (currentUser.peran !== 'Admin' && currentUser.role !== 'Admin') {
    return <Navigate to="/dashboard" replace />
  }

  // State untuk pencarian
  const [searchTerm, setSearchTerm] = useState('')

  // State untuk modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingTipeKamar, setEditingTipeKamar] = useState<any>(null)
  const [deletingTipeKamar, setDeletingTipeKamar] = useState<any>(null)

  // State untuk form
  const [formData, setFormData] = useState<TipeKamarFormData>({
    nama: '',
    deskripsi: '',
    hargaDefault: '',
    kapasitas: '',
    fotoUrl: ''
  })

  // Filtered data berdasarkan pencarian
  const filteredTipeKamar = useMemo(() => {
    return tipeKamar.filter(tipe => {
      const matchesSearch = tipe.nama.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })
  }, [tipeKamar, searchTerm])

  // Reset form
  const resetForm = () => {
    setFormData({
      nama: '',
      deskripsi: '',
      hargaDefault: '',
      kapasitas: '',
      fotoUrl: ''
    })
  }

  // Validasi form
  const isFormValid = () => {
    return formData.nama.trim() !== '' &&
           formData.deskripsi.trim() !== '' &&
           formData.hargaDefault.trim() !== '' &&
           formData.kapasitas.trim() !== '' &&
           formData.fotoUrl.trim() !== '' &&
           Number(formData.hargaDefault) > 0 &&
           Number(formData.kapasitas) > 0 &&
           isValidUrl(formData.fotoUrl)
  }

  // Validasi URL
  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // Check nama uniqueness
  const isNamaUnique = (nama: string, excludeId?: string) => {
    return !tipeKamar.some(tipe => tipe.nama.toLowerCase() === nama.toLowerCase() && tipe.id !== excludeId)
  }

  // Handle tambah tipe kamar
  const handleAddTipeKamar = () => {
    if (!isFormValid()) {
      toast.error('Mohon lengkapi semua field dengan benar')
      return
    }

    if (!isNamaUnique(formData.nama)) {
      toast.error('Nama tipe kamar sudah digunakan.')
      return
    }

    addTipeKamar({
      nama: formData.nama,
      deskripsi: formData.deskripsi,
      hargaDefault: Number(formData.hargaDefault),
      kapasitas: Number(formData.kapasitas),
      fotoUrl: formData.fotoUrl
    })
    toast.success(`Tipe kamar '${formData.nama}' berhasil ditambahkan`)
    setIsAddModalOpen(false)
    resetForm()
  }

  // Handle edit tipe kamar
  const handleEditTipeKamar = () => {
    if (!editingTipeKamar) return

    if (!isFormValid()) {
      toast.error('Mohon lengkapi semua field dengan benar')
      return
    }

    if (!isNamaUnique(formData.nama, editingTipeKamar.id)) {
      toast.error('Nama tipe kamar sudah digunakan.')
      return
    }

    updateTipeKamar(editingTipeKamar.id, {
      nama: formData.nama,
      deskripsi: formData.deskripsi,
      hargaDefault: Number(formData.hargaDefault),
      kapasitas: Number(formData.kapasitas),
      fotoUrl: formData.fotoUrl
    })
    toast.success(`Tipe kamar '${formData.nama}' berhasil diperbarui`)
    setIsEditModalOpen(false)
    setEditingTipeKamar(null)
    resetForm()
  }

  // Handle delete tipe kamar
  const handleDeleteTipeKamar = () => {
    if (!deletingTipeKamar) return

    const success = deleteTipeKamar(deletingTipeKamar.id)
    if (success) {
      toast.success(`Tipe kamar '${deletingTipeKamar.nama}' berhasil dihapus`)
    } else {
      toast.error('Gagal menghapus tipe kamar')
    }
    setIsDeleteModalOpen(false)
    setDeletingTipeKamar(null)
  }

  // Open edit modal
  const openEditModal = (tipe: any) => {
    setEditingTipeKamar(tipe)
    setFormData({
      nama: tipe.nama,
      deskripsi: tipe.deskripsi,
      hargaDefault: tipe.hargaDefault.toString(),
      kapasitas: tipe.kapasitas.toString(),
      fotoUrl: tipe.fotoUrl
    })
    setIsEditModalOpen(true)
  }

  // Open delete modal
  const openDeleteModal = (tipe: any) => {
    setDeletingTipeKamar(tipe)
    setIsDeleteModalOpen(true)
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
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bed className="h-5 w-5" />
              Manajemen Tipe Kamar
            </div>
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setIsAddModalOpen(true) }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Tipe Kamar
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Tambah Tipe Kamar Baru</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="kodeTipe">Kode Tipe</Label>
                    <Input
                      id="kodeTipe"
                      value={generateTipeKamarCode()}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nama">Nama Tipe Kamar *</Label>
                    <Input
                      id="nama"
                      placeholder="Masukkan nama tipe kamar"
                      value={formData.nama}
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    />
                    {formData.nama && !isNamaUnique(formData.nama) && (
                      <p className="text-sm text-red-500">Nama tipe kamar sudah digunakan.</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deskripsi">Deskripsi *</Label>
                    <Textarea
                      id="deskripsi"
                      placeholder="Masukkan deskripsi tipe kamar"
                      value={formData.deskripsi}
                      onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hargaDefault">Harga Default *</Label>
                    <Input
                      id="hargaDefault"
                      type="number"
                      placeholder="Masukkan harga default"
                      value={formData.hargaDefault}
                      onChange={(e) => setFormData({ ...formData, hargaDefault: e.target.value })}
                    />
                    {formData.hargaDefault && Number(formData.hargaDefault) <= 0 && (
                      <p className="text-sm text-red-500">Harga harus lebih dari 0.</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kapasitas">Kapasitas Tamu *</Label>
                    <Input
                      id="kapasitas"
                      type="number"
                      placeholder="Masukkan kapasitas tamu"
                      value={formData.kapasitas}
                      onChange={(e) => setFormData({ ...formData, kapasitas: e.target.value })}
                    />
                    {formData.kapasitas && Number(formData.kapasitas) <= 0 && (
                      <p className="text-sm text-red-500">Kapasitas harus lebih dari 0.</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fotoUrl">URL Foto *</Label>
                    <Input
                      id="fotoUrl"
                      placeholder="Masukkan URL foto"
                      value={formData.fotoUrl}
                      onChange={(e) => setFormData({ ...formData, fotoUrl: e.target.value })}
                    />
                    {formData.fotoUrl && !isValidUrl(formData.fotoUrl) && (
                      <p className="text-sm text-red-500">URL foto tidak valid.</p>
                    )}
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => { setIsAddModalOpen(false); resetForm() }}
                    >
                      Batal
                    </Button>
                    <Button 
                      onClick={handleAddTipeKamar}
                      disabled={!isFormValid() || !isNamaUnique(formData.nama)}
                    >
                      Simpan Perubahan
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Pencarian */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan nama tipe kamar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tabel Tipe Kamar */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Tipe Kamar</TableHead>
                  <TableHead>Harga Default</TableHead>
                  <TableHead>Kapasitas</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTipeKamar.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Tidak ada data tipe kamar yang ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTipeKamar.map((tipe) => (
                    <TableRow key={tipe.id}>
                      <TableCell className="font-medium">{tipe.kodeTipe}</TableCell>
                      <TableCell>
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <img 
                              src={tipe.fotoUrl} 
                              alt={tipe.nama}
                              className="w-16 h-12 object-cover rounded border"
                              onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/64x48?text=No+Image'
                              }}
                            />
                          </div>
                          <div>
                            <div className="font-medium">{tipe.nama}</div>
                            <div className="text-sm text-muted-foreground">{tipe.deskripsi}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(tipe.hargaDefault)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{tipe.kapasitas} Tamu</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(tipe)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {canDeleteTipeKamar(tipe.id) ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteModal(tipe)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled
                                  className="h-8 w-8 p-0"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Tipe kamar ini tidak dapat dihapus karena masih digunakan oleh satu atau lebih kamar.</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Edit Modal */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Tipe Kamar: {editingTipeKamar?.nama}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="editKodeTipe">Kode Tipe</Label>
                  <Input
                    id="editKodeTipe"
                    value={editingTipeKamar?.kodeTipe || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editNama">Nama Tipe Kamar *</Label>
                  <Input
                    id="editNama"
                    placeholder="Masukkan nama tipe kamar"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  />
                  {formData.nama && !isNamaUnique(formData.nama, editingTipeKamar?.id) && (
                    <p className="text-sm text-red-500">Nama tipe kamar sudah digunakan.</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editDeskripsi">Deskripsi *</Label>
                  <Textarea
                    id="editDeskripsi"
                    placeholder="Masukkan deskripsi tipe kamar"
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editHargaDefault">Harga Default *</Label>
                  <Input
                    id="editHargaDefault"
                    type="number"
                    placeholder="Masukkan harga default"
                    value={formData.hargaDefault}
                    onChange={(e) => setFormData({ ...formData, hargaDefault: e.target.value })}
                  />
                  {formData.hargaDefault && Number(formData.hargaDefault) <= 0 && (
                    <p className="text-sm text-red-500">Harga harus lebih dari 0.</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editKapasitas">Kapasitas Tamu *</Label>
                  <Input
                    id="editKapasitas"
                    type="number"
                    placeholder="Masukkan kapasitas tamu"
                    value={formData.kapasitas}
                    onChange={(e) => setFormData({ ...formData, kapasitas: e.target.value })}
                  />
                  {formData.kapasitas && Number(formData.kapasitas) <= 0 && (
                    <p className="text-sm text-red-500">Kapasitas harus lebih dari 0.</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editFotoUrl">URL Foto *</Label>
                  <Input
                    id="editFotoUrl"
                    placeholder="Masukkan URL foto"
                    value={formData.fotoUrl}
                    onChange={(e) => setFormData({ ...formData, fotoUrl: e.target.value })}
                  />
                  {formData.fotoUrl && !isValidUrl(formData.fotoUrl) && (
                    <p className="text-sm text-red-500">URL foto tidak valid.</p>
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => { setIsEditModalOpen(false); setEditingTipeKamar(null); resetForm() }}
                  >
                    Batal
                  </Button>
                  <Button 
                    onClick={handleEditTipeKamar}
                    disabled={!isFormValid() || !isNamaUnique(formData.nama, editingTipeKamar?.id)}
                  >
                    Simpan Perubahan
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Modal */}
          <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus Tipe Kamar</AlertDialogTitle>
                <AlertDialogDescription>
                  Anda yakin ingin menghapus tipe kamar <strong>{deletingTipeKamar?.nama}</strong>? 
                  Tindakan ini tidak dapat dibatalkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => { setIsDeleteModalOpen(false); setDeletingTipeKamar(null) }}>
                  Batal
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteTipeKamar} className="bg-red-600 hover:bg-red-700">
                  Ya, Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}