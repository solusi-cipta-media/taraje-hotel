import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'

export default function LaporanOkupansiPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Laporan - Okupansi
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Halaman untuk melihat laporan tingkat okupansi kamar dan analisis pendapatan.
        </p>
      </CardContent>
    </Card>
  )
}