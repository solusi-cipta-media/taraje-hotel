import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { UserPlus, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

export default function DaftarPage() {
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { register, users } = useAppStore()
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Validation
      if (formData.password !== formData.confirmPassword) {
        setError('Password dan konfirmasi password tidak sama')
        return
      }

      if (formData.password.length < 6) {
        setError('Password minimal 6 karakter')
        return
      }

      // Check if email already exists
      if (users.some(user => user.email === formData.email)) {
        setError('Email sudah terdaftar')
        return
      }

      register({
        nama: formData.nama,
        email: formData.email,
        password: formData.password,
        role: 'Customer'
      })

      toast.success('Pendaftaran berhasil! Selamat datang!')
      navigate('/')
    } catch (err) {
      setError('Terjadi kesalahan saat mendaftar')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <UserPlus className="h-12 w-12 mx-auto text-primary" />
        <h1 className="text-2xl font-bold">Daftar Akun Baru</h1>
        <p className="text-muted-foreground">
          Buat akun untuk mulai memesan kamar
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Pendaftaran</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="nama">Nama Lengkap</Label>
              <Input
                id="nama"
                name="nama"
                type="text"
                value={formData.nama}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="masukkan@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimal 6 karakter"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Ulangi password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Sedang mendaftar...' : 'Daftar'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-center text-muted-foreground">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Masuk sekarang
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}