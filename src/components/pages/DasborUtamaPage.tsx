import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Bed,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

export default function DasborUtamaPage() {
  const { users, kamar, pemesanan, transaksi, tipeKamar } = useAppStore();

  // Calculate statistics
  const totalCustomers = users.filter((u) => u.role === "Customer").length;
  const totalRooms = kamar.length;
  const availableRooms = kamar.filter((k) => k.status === "Tersedia").length;
  const occupiedRooms = kamar.filter((k) => k.status === "Terisi").length;
  const maintenanceRooms = kamar.filter(
    (k) => k.status === "Maintenance"
  ).length;

  const totalBookings = pemesanan.length;
  const pendingBookings = pemesanan.filter(
    (p) => p.status === "Pending"
  ).length;
  const confirmedBookings = pemesanan.filter(
    (p) => p.status === "Confirmed"
  ).length;
  const checkedInBookings = pemesanan.filter(
    (p) => p.status === "CheckedIn"
  ).length;

  const totalRevenue = transaksi
    .filter((t) => t.status === "Success")
    .reduce((sum, t) => sum + t.jumlah, 0);

  const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

  const statsCards = [
    {
      title: "Total Pelanggan",
      value: totalCustomers,
      icon: Users,
      description: "Pelanggan terdaftar",
    },
    {
      title: "Kamar Tersedia",
      value: availableRooms,
      icon: Bed,
      description: `dari ${totalRooms} total kamar`,
    },
    {
      title: "Pemesanan Aktif",
      value: confirmedBookings + checkedInBookings,
      icon: Calendar,
      description: "Pemesanan dikonfirmasi",
    },
    {
      title: "Total Pendapatan",
      value: `Rp ${totalRevenue.toLocaleString("id-ID")}`,
      icon: DollarSign,
      description: "Pendapatan bulan ini",
    },
  ];

  const recentBookings = pemesanan.slice(-5).reverse();

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "default";
      case "CheckedIn":
        return "secondary";
      case "CheckedOut":
        return "outline";
      case "Cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "Pending":
        return "Menunggu Konfirmasi";
      case "Confirmed":
        return "Dikonfirmasi";
      case "CheckedIn":
        return "Check-in";
      case "CheckedOut":
        return "Check-out";
      case "Cancelled":
        return "Dibatalkan";
      default:
        return status;
    }
  };

  const getRoomName = (tipeKamarId: string) => {
    const room = tipeKamar.find((tk) => tk.id === tipeKamarId);
    return room?.nama || "Unknown Room";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bed className="h-5 w-5" />
              Status Kamar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Tersedia</span>
                </div>
                <span className="font-medium">{availableRooms}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Terisi</span>
                </div>
                <span className="font-medium">{occupiedRooms}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Maintenance</span>
                </div>
                <span className="font-medium">{maintenanceRooms}</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tingkat Okupansi</span>
                <span className="font-semibold">
                  {occupancyRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${occupancyRate}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Ringkasan Pemesanan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {pendingBookings}
                </div>
                <div className="text-xs text-muted-foreground">
                  Menunggu Konfirmasi
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {confirmedBookings}
                </div>
                <div className="text-xs text-muted-foreground">
                  Dikonfirmasi
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-center">
                <div className="text-3xl font-bold">{totalBookings}</div>
                <div className="text-sm text-muted-foreground">
                  Total Pemesanan
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Pemesanan Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {recentBookings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Belum ada pemesanan</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="font-medium">
                      {booking.tipeKamarId
                        ? getRoomName(booking.tipeKamarId)
                        : "-"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(booking.tanggalCheckIn)} -{" "}
                      {formatDate(booking.tanggalCheckOut)}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    {booking.status && (
                      <Badge variant={getStatusVariant(booking.status)}>
                        {getStatusText(booking.status)}
                      </Badge>
                    )}
                    <p className="text-sm font-medium">
                      Rp{" "}
                      {booking.totalHarga
                        ? booking.totalHarga.toLocaleString("id-ID")
                        : "-"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
