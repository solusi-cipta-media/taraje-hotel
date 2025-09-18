import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'

// Layouts
import LayoutPelanggan from '@/components/layouts/LayoutPelanggan'
import LayoutInternal from '@/components/layouts/LayoutInternal'

// Public & Customer Pages
import HalamanUtamaPage from '@/components/pages/HalamanUtamaPage'
import GaleriPaketPage from '@/components/pages/GaleriPaketPage'
import LoginPage from '@/components/pages/LoginPage'
import DaftarPage from '@/components/pages/DaftarPage'
import AlurPemesananPage from '@/components/pages/AlurPemesananPage'
import AkunPesananPage from '@/components/pages/AkunPesananPage'
import AkunProfilPage from '@/components/pages/AkunProfilPage'

// Internal Dashboard Pages
import DasborUtamaPage from '@/components/pages/DasborUtamaPage'
import MasterPenggunaPage from '@/components/pages/MasterPenggunaPage'
import MasterTipeKamarPage from '@/components/pages/MasterTipeKamarPage'
import MasterTamuPage from '@/components/pages/MasterTamuPage'
import OperasionalKamarPage from '@/components/pages/OperasionalKamarPage'
import OperasionalPemesananPage from '@/components/pages/OperasionalPemesananPage'
import OperasionalTransaksiPage from '@/components/pages/OperasionalTransaksiPage'
import LaporanOkupansiPage from '@/components/pages/LaporanOkupansiPage'

// 404 Page
import HalamanNotFound404Page from '@/components/pages/HalamanNotFound404Page'

function App() {
  return (
    <Router>
      <Routes>
        {/* Internal Dashboard Routes */}
        <Route path="/dashboard" element={<LayoutInternal />}>
          <Route index element={<DasborUtamaPage />} />
          <Route path="master-data/pengguna" element={<MasterPenggunaPage />} />
          <Route path="master-data/tipe-kamar" element={<MasterTipeKamarPage />} />
          <Route path="master-data/tamu" element={<MasterTamuPage />} />
          <Route path="operasional/kamar" element={<OperasionalKamarPage />} />
          <Route path="operasional/pemesanan" element={<OperasionalPemesananPage />} />
          <Route path="operasional/transaksi" element={<OperasionalTransaksiPage />} />
          <Route path="laporan/okupansi" element={<LaporanOkupansiPage />} />
        </Route>

        {/* Public & Customer Routes */}
        <Route path="/" element={<LayoutPelanggan />}>
          <Route index element={<HalamanUtamaPage />} />
          <Route path="paket" element={<GaleriPaketPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="daftar" element={<DaftarPage />} />
          <Route path="pesan/:tipeKamarId" element={<AlurPemesananPage />} />
          <Route path="akun/pesanan-saya" element={<AkunPesananPage />} />
          <Route path="akun/profil-saya" element={<AkunProfilPage />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<HalamanNotFound404Page />} />
      </Routes>

      {/* Global Toast Notifications */}
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
        }}
      />
    </Router>
  )
}

export default App