import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Calendar, Shield, Edit, Save, X } from "lucide-react";
import { toast } from "sonner";

export default function AkunProfilPage() {
  const { currentUser } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nama: currentUser?.nama || "",
    email: currentUser?.email || "",
  });

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const handleSave = () => {
    // In a real app, this would update the user in the store
    toast.success("Profil berhasil diperbarui");
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (currentUser) {
      setFormData({
        nama: currentUser.nama,
        email: currentUser.email,
      });
    }
    setIsEditing(false);
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "Admin":
        return "Administrator";
      case "Resepsionis":
        return "Resepsionis";
      case "Customer":
        return "Pelanggan";
      default:
        return role;
    }
  };

  const getRoleVariant = (role: string) => {
    switch (role) {
      case "Admin":
        return "default";
      case "Resepsionis":
        return "secondary";
      case "Customer":
        return "outline";
      default:
        return "outline";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Profil Saya</h1>
        <p className="text-muted-foreground">Kelola informasi profil Anda</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informasi Profil
            </CardTitle>
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Batal
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Simpan
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap</Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, nama: e.target.value }))
                  }
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="Masukkan email"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{currentUser.nama}</p>
                  <p className="text-sm text-muted-foreground">Nama Lengkap</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{currentUser.email}</p>
                  <p className="text-sm text-muted-foreground">Email</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Badge variant={getRoleVariant(currentUser.role)}>
                    {getRoleText(currentUser.role)}
                  </Badge>
                  <p className="text-sm text-muted-foreground">Peran</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {formatDate(currentUser.tanggalDaftar)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tanggal Bergabung
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Akun</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            Ubah Password
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Notifikasi
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Preferensi
          </Button>
        </CardContent>
      </Card>

      {/* Account Actions */}
      {currentUser.role === "Customer" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Zona Bahaya</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" className="w-full">
              Hapus Akun
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Tindakan ini tidak dapat dibatalkan. Semua data Anda akan dihapus
              permanen.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
