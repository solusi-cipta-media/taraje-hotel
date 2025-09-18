import React, { useState, useMemo } from 'react'
import { Plus, Search, Edit, Trash2, UserCheck } from 'lucide-react'
import { toast } from 'sonner'

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { useAppStore, Tamu } from '@/lib/store'

interface TamuFormData {
  namaLengkap: string
  email: string
  telepon: string
  tipeIdentitas: 'KTP' | 'SIM' | 'Paspor'
  nomorIdentitas: string
  alamat: string
  catatan: string
}

const initialFormData: TamuFormData = {
  namaLengkap: '',
  email: '',
  telepon: '',
  tipeIdentitas: 'KTP',
  nomorIdentitas: '',
  alamat: '',
  catatan: ''
}

export default function MasterTamuPage() {
  const { 
    currentUser, 
    tamu, 
    addTamu, 
    updateTamu, 
    deleteTamu, 
    canDeleteTamu, 
    generateTamuCode 
  } = useAppStore()

  // State management
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedTamu, setSelectedTamu] = useState<Tamu | null>(null)
  const [formData, setFormData] = useState<TamuFormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<Partial<TamuFormData>>({})

  // Access control - Only Admin can access this page
  if (currentUser?.peran !== 'Admin') {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-96">
          <p className="text-lg font-medium text-muted-foreground">Akses Ditolak</p>
          <p className="text-sm text-muted-foreground">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        </CardContent>
      </Card>
    )
  }

  // Filter tamu based on search term
  const filteredTamu = useMemo(() => {
    if (!searchTerm) return tamu
    const search = searchTerm.toLowerCase()
    return tamu.filter(t => 
      t.namaLengkap.toLowerCase().includes(search) ||
      t.email.toLowerCase().includes(search) ||
      t.telepon.includes(search)
    )
  }, [tamu, searchTerm])

  // Validation function
  const validateForm = (data: TamuFormData): boolean => {
    const errors: Partial<TamuFormData> = {}

    if (!data.namaLengkap.trim()) {
      errors.namaLengkap = 'Nama lengkap wajib diisi'
    }

    if (!data.email.trim()) {
      errors.email = 'Email wajib diisi'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Format email tidak valid'
    } else {
      // Check for duplicate email (excluding current tamu when editing)
      const duplicateEmail = tamu.find(t => 
        t.email === data.email && t.id !== selectedTamu?.id
      )
      if (duplicateEmail) {
        errors.email = 'Email ini sudah terdaftar'
      }
    }

    if (!data.telepon.trim()) {
      errors.telepon = 'Nomor telepon wajib diisi'
    } else if (!/^\d+$/.test(data.telepon.replace(/[\s-]/g, ''))) {
      errors.telepon = 'Nomor telepon harus berupa angka'
    }

    if (!data.nomorIdentitas.trim()) {
      errors.nomorIdentitas = 'Nomor identitas wajib diisi'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm(formData)) return

    try {
      if (selectedTamu) {
        // Update existing tamu
        updateTamu(selectedTamu.id, formData)
        toast.success(`Data tamu "${formData.namaLengkap}" berhasil diperbarui`)
      } else {
        // Add new tamu
        addTamu(formData)
        toast.success(`Data tamu "${formData.namaLengkap}" berhasil ditambahkan`)
      }
      handleCloseModal()
    } catch (error) {
      toast.error('Terjadi kesalahan saat menyimpan data')
    }
  }

  // Handle delete tamu
  const handleDelete = () => {
    if (!selectedTamu) return

    try {
      const success = deleteTamu(selectedTamu.id)
      if (success) {
        toast.success(`Data tamu "${selectedTamu.namaLengkap}" berhasil dihapus`)
        setIsDeleteModalOpen(false)
        setSelectedTamu(null)
      } else {
        toast.error('Tamu ini tidak dapat dihapus karena memiliki riwayat pemesanan')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat menghapus data')
    }
  }

  // Modal handlers
  const handleOpenAddModal = () => {
    setSelectedTamu(null)
    setFormData(initialFormData)
    setFormErrors({})
    setIsAddEditModalOpen(true)
  }

  const handleOpenEditModal = (tamu: Tamu) => {
    setSelectedTamu(tamu)
    setFormData({
      namaLengkap: tamu.namaLengkap,
      email: tamu.email,
      telepon: tamu.telepon,
      tipeIdentitas: tamu.tipeIdentitas,
      nomorIdentitas: tamu.nomorIdentitas,
      alamat: tamu.alamat,
      catatan: tamu.catatan
    })
    setFormErrors({})
    setIsAddEditModalOpen(true)
  }

  const handleOpenDeleteModal = (tamu: Tamu) => {
    setSelectedTamu(tamu)
    setIsDeleteModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsAddEditModalOpen(false)
    setSelectedTamu(null)
    setFormData(initialFormData)
    setFormErrors({})
  }

  const isFormValid = useMemo(() => {
    return formData.namaLengkap.trim() && 
           formData.email.trim() && 
           formData.telepon.trim() && 
           formData.nomorIdentitas.trim() &&
           Object.keys(formErrors).length === 0
  }, [formData, formErrors])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Database Tamu
            </div>
            <Button onClick={handleOpenAddModal} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Tambah Data Tamu
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {/* Search Bar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan nama, email, atau telepon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tamu Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama Lengkap</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead>Identitas</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTamu.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <UserCheck className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {searchTerm ? 'Tidak ada tamu yang ditemukan' : 'Belum ada data tamu'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTamu.map((tamuItem) => (
                    <TableRow key={tamuItem.id}>
                      <TableCell className="font-medium">{tamuItem.kodeTamu}</TableCell>
                      <TableCell>{tamuItem.namaLengkap}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">{tamuItem.email}</div>
                          <div className="text-sm text-muted-foreground">{tamuItem.telepon}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant="outline">{tamuItem.tipeIdentitas}</Badge>
                          <div className="text-sm text-muted-foreground">{tamuItem.nomorIdentitas}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenEditModal(tamuItem)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit Data Tamu</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenDeleteModal(tamuItem)}
                                  disabled={!canDeleteTamu(tamuItem.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {canDeleteTamu(tamuItem.id) 
                                    ? 'Hapus Data Tamu' 
                                    : 'Tamu ini tidak dapat dihapus karena memiliki riwayat pemesanan'
                                  }
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={isAddEditModalOpen} onOpenChange={setIsAddEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedTamu ? `Edit Data Tamu: ${selectedTamu.namaLengkap}` : 'Tambah Data Tamu Baru'}
            </DialogTitle>
            <DialogDescription>
              {selectedTamu ? 'Perbarui informasi data tamu.' : `Kode tamu: ${generateTamuCode()}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Nama Lengkap */}
            <div className="space-y-2">
              <Label htmlFor="namaLengkap">Nama Lengkap <span className="text-red-500">*</span></Label>
              <Input
                id="namaLengkap"
                value={formData.namaLengkap}
                onChange={(e) => setFormData(prev => ({ ...prev, namaLengkap: e.target.value }))}
                placeholder="Masukkan nama lengkap"
              />
              {formErrors.namaLengkap && (
                <p className="text-sm text-red-500">{formErrors.namaLengkap}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Masukkan alamat email"
              />
              {formErrors.email && (
                <p className="text-sm text-red-500">{formErrors.email}</p>
              )}
            </div>

            {/* Nomor Telepon */}
            <div className="space-y-2">
              <Label htmlFor="telepon">Nomor Telepon <span className="text-red-500">*</span></Label>
              <Input
                id="telepon"
                value={formData.telepon}
                onChange={(e) => setFormData(prev => ({ ...prev, telepon: e.target.value }))}
                placeholder="Masukkan nomor telepon"
              />
              {formErrors.telepon && (
                <p className="text-sm text-red-500">{formErrors.telepon}</p>
              )}
            </div>

            {/* Tipe Identitas */}
            <div className="space-y-2">
              <Label htmlFor="tipeIdentitas">Tipe Identitas <span className="text-red-500">*</span></Label>
              <Select 
                value={formData.tipeIdentitas} 
                onValueChange={(value: 'KTP' | 'SIM' | 'Paspor') => 
                  setFormData(prev => ({ ...prev, tipeIdentitas: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe identitas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KTP">KTP</SelectItem>
                  <SelectItem value="SIM">SIM</SelectItem>
                  <SelectItem value="Paspor">Paspor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Nomor Identitas */}
            <div className="space-y-2">
              <Label htmlFor="nomorIdentitas">Nomor Identitas <span className="text-red-500">*</span></Label>
              <Input
                id="nomorIdentitas"
                value={formData.nomorIdentitas}
                onChange={(e) => setFormData(prev => ({ ...prev, nomorIdentitas: e.target.value }))}
                placeholder="Masukkan nomor identitas"
              />
              {formErrors.nomorIdentitas && (
                <p className="text-sm text-red-500">{formErrors.nomorIdentitas}</p>
              )}
            </div>

            {/* Alamat */}
            <div className="space-y-2">
              <Label htmlFor="alamat">Alamat</Label>
              <Textarea
                id="alamat"
                value={formData.alamat}
                onChange={(e) => setFormData(prev => ({ ...prev, alamat: e.target.value }))}
                placeholder="Masukkan alamat (opsional)"
                rows={3}
              />
            </div>

            {/* Catatan Internal */}
            <div className="space-y-2">
              <Label htmlFor="catatan">Catatan Internal</Label>
              <Textarea
                id="catatan"
                value={formData.catatan}
                onChange={(e) => setFormData(prev => ({ ...prev, catatan: e.target.value }))}
                placeholder="Catatan internal tentang tamu (opsional)"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={!isFormValid}>
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus Data Tamu</AlertDialogTitle>
            <AlertDialogDescription>
              Anda yakin ingin menghapus data tamu "{selectedTamu?.namaLengkap}"? 
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteModalOpen(false)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}