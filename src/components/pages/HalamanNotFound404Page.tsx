import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function HalamanNotFound404Page() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center space-y-6">
          <AlertTriangle className="h-16 w-16 mx-auto text-muted-foreground" />
          <div>
            <h1 className="text-4xl font-bold mb-2">404</h1>
            <h2 className="text-xl font-semibold mb-2">
              Halaman Tidak Ditemukan
            </h2>
            <p className="text-muted-foreground">
              Maaf, halaman yang Anda cari tidak dapat ditemukan.
            </p>
          </div>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link to="/">Kembali ke Beranda</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/paket">Lihat Paket Kamar</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
