import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard } from 'lucide-react'

export default function OperasionalTransaksiPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Operasional - Transaksi
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Halaman untuk mengelola transaksi pembayaran dan metode pembayaran.
        </p>
      </CardContent>
    </Card>
  )
}