import React, { useState } from 'react'
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  LayoutDashboard,
  Users,
  Bed,
  UserCheck,
  DoorOpen,
  Calendar,
  CreditCard,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu
} from 'lucide-react'

const navigationItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard'
  },
  {
    title: 'Master Data',
    icon: Users,
    children: [
      { title: 'Pengguna', href: '/dashboard/master-data/pengguna' },
      { title: 'Tipe Kamar', href: '/dashboard/master-data/tipe-kamar' },
      { title: 'Tamu', href: '/dashboard/master-data/tamu' }
    ]
  },
  {
    title: 'Operasional',
    icon: DoorOpen,
    children: [
      { title: 'Kamar', href: '/dashboard/operasional/kamar' },
      { title: 'Pemesanan', href: '/dashboard/operasional/pemesanan' },
      { title: 'Transaksi', href: '/dashboard/operasional/transaksi' }
    ]
  },
  {
    title: 'Laporan',
    icon: BarChart3,
    children: [
      { title: 'Okupansi', href: '/dashboard/laporan/okupansi' }
    ]
  }
]

export default function LayoutInternal() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { currentUser, logout, login } = useAppStore()
  const location = useLocation()

  // Temporary auto-login for development testing
  React.useEffect(() => {
    if (!currentUser) {
      login('admin@barutaraje.com', 'admin123')
    }
  }, [currentUser, login])

  // Redirect if not logged in or not admin/receptionist
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }
  
  if (currentUser.role === 'Customer') {
    return <Navigate to="/login" replace />
  }

  const getPageTitle = () => {
    const path = location.pathname
    if (path === '/dashboard') return 'Dashboard Utama'
    if (path.includes('pengguna')) return 'Master Data - Pengguna'
    if (path.includes('tipe-kamar')) return 'Master Data - Tipe Kamar'
    if (path.includes('tamu')) return 'Master Data - Tamu'
    if (path.includes('operasional/kamar')) return 'Operasional - Kamar'
    if (path.includes('operasional/pemesanan')) return 'Operasional - Pemesanan'
    if (path.includes('operasional/transaksi')) return 'Operasional - Transaksi'
    if (path.includes('laporan/okupansi')) return 'Laporan - Okupansi'
    return 'Dashboard'
  }

  return (
    <div className="flex h-screen bg-muted/30">
      {/* Sidebar */}
      <div className={`bg-card border-r border-border transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <h1 className="text-lg font-semibold text-primary">Baru Taraje</h1>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <nav className="p-2 space-y-2">
          {navigationItems.map((item) => {
            // Hide Master Data section for non-admin users
            if (item.title === 'Master Data' && currentUser && currentUser.role !== 'Admin' && currentUser.peran !== 'Admin') {
              return null
            }
            
            return (
              <div key={item.title}>
                {item.children ? (
                  <div className="space-y-1">
                    <div className={`flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground ${
                      sidebarCollapsed ? 'justify-center' : ''
                    }`}>
                      <item.icon className="h-4 w-4" />
                      {!sidebarCollapsed && <span>{item.title}</span>}
                    </div>
                    {!sidebarCollapsed && item.children.map((child) => {
                      // Hide Pengguna menu for non-admin users
                      if (child.title === 'Pengguna' && currentUser && currentUser.role !== 'Admin' && currentUser.peran !== 'Admin') {
                        return null
                      }
                      
                      return (
                        <Link
                          key={child.href}
                          to={child.href}
                          className={`flex items-center gap-3 px-6 py-2 text-sm rounded-md transition-colors ${
                            location.pathname === child.href
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          }`}
                        >
                          <span>{child.title}</span>
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <Link
                    to={item.href}
                    className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                      sidebarCollapsed ? 'justify-center' : ''
                    } ${
                      location.pathname === item.href
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {!sidebarCollapsed && <span>{item.title}</span>}
                  </Link>
                )}
              </div>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{getPageTitle()}</h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {currentUser?.namaLengkap || currentUser?.nama} ({currentUser?.peran || currentUser?.role})
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}