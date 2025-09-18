import { Navigate } from "react-router-dom";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, DollarSign, Clock } from "lucide-react";

export default function AkunPesananPage() {
  const { currentUser, pemesanan, tipeKamar } = useAppStore();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const userBookings = pemesanan.filter(
    (booking) => booking.customerId === currentUser.id
  );

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
      month: "long",
      year: "numeric",
    });
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Pesanan Saya</h1>
        <p className="text-muted-foreground">
          Riwayat dan status pemesanan kamar Anda
        </p>
      </div>

      {userBookings.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="font-semibold mb-2">Belum Ada Pesanan</h3>
              <p className="text-muted-foreground">
                Anda belum memiliki riwayat pemesanan kamar.
              </p>
            </div>
            <Button>Mulai Pesan Kamar</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {userBookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    {getRoomName(booking.tipeKamarId)}
                  </CardTitle>
                  <Badge variant={getStatusVariant(booking.status)}>
                    {getStatusText(booking.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Check-in</span>
                    </div>
                    <p>{formatDate(booking.tanggalCheckIn)}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Check-out</span>
                    </div>
                    <p>{formatDate(booking.tanggalCheckOut)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {calculateNights(
                        booking.tanggalCheckIn,
                        booking.tanggalCheckOut
                      )}{" "}
                      malam
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Kamar {booking.kamarId}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">
                      Rp {booking.totalHarga.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Dipesan: {formatDate(booking.tanggalPesan)}
                  </div>
                </div>

                {booking.status === "Pending" && (
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Batalkan
                    </Button>
                    <Button size="sm" className="flex-1">
                      Bayar Sekarang
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
