import { create } from "zustand";

export interface User {
  id: string;
  kodePengguna?: string; // For staff only (Admin & Resepsionis)
  namaLengkap: string;
  nama: string; // Keep for backward compatibility
  email: string;
  telepon?: string;
  peran: "Admin" | "Resepsionis" | "Customer";
  role: "Admin" | "Resepsionis" | "Customer"; // Keep for backward compatibility
  status: "Aktif" | "Tidak Aktif";
  password: string;
  tanggalDaftar: string;
}

export interface TipeKamar {
  id: string;
  kodeTipe: string; // User-facing ID, contoh: 'TK-01'
  nama: string;
  deskripsi: string;
  hargaDefault: number;
  kapasitas: number; // Jumlah tamu
  fotoUrl: string; // URL gambar representatif
  // Keep legacy fields for backward compatibility
  harga?: number;
  fasilitas?: string[];
  gambar?: string[];
}

export interface Tamu {
  id: string;
  kodeTamu: string; // User-facing ID, contoh: 'TAMU-001'
  namaLengkap: string;
  email: string;
  telepon: string;
  tipeIdentitas: "KTP" | "SIM" | "Paspor";
  nomorIdentitas: string;
  alamat: string; // Opsional
  catatan: string; // Catatan internal tentang tamu, opsional
  // Keep legacy fields for backward compatibility
  nama?: string;
  noTelepon?: string;
}

export interface Kamar {
  id: string;
  nomor: string;
  tipeKamarId: string;
  status:
    | "Tersedia"
    | "Dipesan"
    | "Dibersihkan"
    | "Perbaikan"
    | "Terisi"
    | "Maintenance";
  lantai: number;
  posisiLayout: number | null;
}

export interface Pemesanan {
  id: string;
  kodeBooking: string; // Contoh: 'BOOK-20250912-001'
  tamuId: string; // ref ke globalState.tamu
  kamarId: string; // ref ke globalState.kamar
  tanggalCheckIn: string; // 'YYYY-MM-DD'
  tanggalCheckOut: string; // 'YYYY-MM-DD'
  jumlahMalam: number;
  totalBiaya: number;
  totalTerbayar: number;
  sisaPembayaran: number;
  statusPembayaran: "Belum Bayar" | "DP" | "Lunas";
  statusPemesanan: "Confirmed" | "Checked-in" | "Checked-out" | "Cancelled";
  catatan: string; // Untuk permintaan khusus dari tamu
  // Legacy fields for backward compatibility
  customerId?: string;
  tipeKamarId?: string;
  totalHarga?: number;
  status?: "Pending" | "Confirmed" | "CheckedIn" | "CheckedOut" | "Cancelled";
  tanggalPesan?: string;
}

export interface LayoutLantai {
  id: string;
  lantai: number;
  gridKolom: number;
  gridBaris: number;
}

export interface Transaksi {
  id: string;
  pemesananId: string;
  tanggal: string;
  jenis: "Uang Muka" | "Pelunasan" | "Pembayaran Parsial" | "Refund";
  jumlah: number;
  metode: "Transfer Bank" | "Kartu Kredit" | "Tunai";
  // Legacy fields for backward compatibility
  metodePembayaran?: "Cash" | "Transfer" | "Card";
  status?: "Pending" | "Success" | "Failed";
  tanggalTransaksi?: string;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  tipeKamar: TipeKamar[];
  tamu: Tamu[];
  kamar: Kamar[];
  pemesanan: Pemesanan[];
  transaksi: Transaksi[];
  layoutLantai: LayoutLantai[];
}

export interface AppActions {
  login: (email: string, password: string) => User | null;
  logout: () => void;
  register: (userData: Omit<User, "id" | "tanggalDaftar">) => void;
  // User management actions for staff
  addStaffUser: (
    userData: Omit<User, "id" | "kodePengguna" | "tanggalDaftar">
  ) => void;
  updateStaffUser: (id: string, userData: Partial<User>) => void;
  deleteStaffUser: (id: string) => void;
  toggleStaffStatus: (id: string) => void;
  resetStaffPassword: (id: string) => string;
  generateStaffCode: () => string;
  // Tipe Kamar management actions
  addTipeKamar: (tipeKamar: Omit<TipeKamar, "id" | "kodeTipe">) => void;
  updateTipeKamar: (id: string, tipeKamar: Partial<TipeKamar>) => void;
  deleteTipeKamar: (id: string) => boolean;
  generateTipeKamarCode: () => string;
  canDeleteTipeKamar: (id: string) => boolean;
  // Tamu management actions
  addTamu: (tamu: Omit<Tamu, "id" | "kodeTamu">) => void;
  updateTamu: (id: string, tamu: Partial<Tamu>) => void;
  deleteTamu: (id: string) => boolean;
  generateTamuCode: () => string;
  canDeleteTamu: (id: string) => boolean;
  // Booking management actions
  addPemesanan: (pemesanan: Omit<Pemesanan, "id" | "kodeBooking">) => string;
  updatePemesanan: (id: string, pemesanan: Partial<Pemesanan>) => void;
  cancelPemesanan: (id: string) => void;
  generateBookingCode: () => string;
  checkRoomAvailability: (
    kamarId: string,
    checkIn: string,
    checkOut: string,
    excludePemesananId?: string
  ) => boolean;
  getAvailableRooms: (
    checkIn: string,
    checkOut: string,
    tipeKamarId?: string
  ) => Kamar[];
  calculateNights: (checkIn: string, checkOut: string) => number;
  calculateTotalCost: (kamarId: string, nights: number) => number;
  // Transaction management actions
  addTransaksi: (transaksi: Omit<Transaksi, "id">) => void;
  getTransaksiByPemesanan: (pemesananId: string) => Transaksi[];
  // Room management actions
  updateRoomStatus: (id: string, status: Kamar["status"]) => void;
  canUpdateRoomStatus: (id: string, newStatus: Kamar["status"]) => boolean;
  getAvailableStatusOptions: (
    currentStatus: Kamar["status"]
  ) => Kamar["status"][];
  // Layout management actions (Admin only)
  updateLayoutLantai: (
    lantai: number,
    gridKolom: number,
    gridBaris: number
  ) => void;
  updateRoomPosition: (
    roomId: string,
    lantai: number,
    posisiLayout: number | null
  ) => void;
  getLayoutForFloor: (lantai: number) => LayoutLantai | undefined;
  getRoomsForFloor: (lantai: number) => Kamar[];
  getUnpositionedRoomsForFloor: (lantai: number) => Kamar[];
}

const initialState: AppState = {
  currentUser: null,
  users: [
    {
      id: "1",
      kodePengguna: "STF-001",
      namaLengkap: "Admin Utama",
      nama: "Admin Utama",
      email: "admin@barutaraje.com",
      telepon: "081234567890",
      peran: "Admin",
      role: "Admin",
      status: "Aktif",
      password: "admin123",
      tanggalDaftar: "2024-01-01",
    },
    {
      id: "2",
      kodePengguna: "STF-002",
      namaLengkap: "Resepsionis Pertama",
      nama: "Resepsionis Pertama",
      email: "resepsionis@barutaraje.com",
      telepon: "081234567891",
      peran: "Resepsionis",
      role: "Resepsionis",
      status: "Aktif",
      password: "resepsionis123",
      tanggalDaftar: "2024-01-01",
    },
    {
      id: "3",
      namaLengkap: "John Doe",
      nama: "John Doe",
      email: "john@email.com",
      telepon: "081234567892",
      peran: "Customer",
      role: "Customer",
      status: "Aktif",
      password: "customer123",
      tanggalDaftar: "2024-01-15",
    },
  ],
  tipeKamar: [
    {
      id: "1",
      kodeTipe: "TK-01",
      nama: "Standard Room",
      deskripsi: "Kamar standar dengan fasilitas lengkap",
      hargaDefault: 500000,
      kapasitas: 2,
      fotoUrl:
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400",
      // Legacy fields for backward compatibility
      harga: 500000,
      fasilitas: ["AC", "TV", "WiFi", "Kamar Mandi Dalam"],
      gambar: ["/images/standard-room.jpg"],
    },
    {
      id: "2",
      kodeTipe: "TK-02",
      nama: "Deluxe Room",
      deskripsi: "Kamar deluxe dengan pemandangan indah",
      hargaDefault: 750000,
      kapasitas: 3,
      fotoUrl:
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400",
      // Legacy fields for backward compatibility
      harga: 750000,
      fasilitas: [
        "AC",
        "TV",
        "WiFi",
        "Kamar Mandi Dalam",
        "Balkon",
        "Mini Bar",
      ],
      gambar: ["/images/deluxe-room.jpg"],
    },
    {
      id: "3",
      kodeTipe: "TK-03",
      nama: "Suite Room",
      deskripsi: "Kamar suite mewah dengan ruang tamu terpisah",
      hargaDefault: 1200000,
      kapasitas: 4,
      fotoUrl:
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400",
      // Legacy fields for backward compatibility
      harga: 1200000,
      fasilitas: [
        "AC",
        "TV",
        "WiFi",
        "Kamar Mandi Dalam",
        "Balkon",
        "Mini Bar",
        "Ruang Tamu",
        "Jacuzzi",
      ],
      gambar: ["/images/suite-room.jpg"],
    },
  ],
  tamu: [
    {
      id: "1",
      kodeTamu: "TAMU-001",
      namaLengkap: "Rina Marlina",
      email: "rina.marlina@email.com",
      telepon: "081234567893",
      tipeIdentitas: "KTP" as const,
      nomorIdentitas: "3571234567890123",
      alamat: "Jl. Merdeka No. 123, Jakarta",
      catatan: "Tamu regular, suka kamar dengan pemandangan",
      // Legacy fields
      nama: "Rina Marlina",
      noTelepon: "081234567893",
    },
    {
      id: "2",
      kodeTamu: "TAMU-002",
      namaLengkap: "Ahmad Budiman",
      email: "ahmad.budiman@email.com",
      telepon: "081234567894",
      tipeIdentitas: "SIM" as const,
      nomorIdentitas: "SIM1234567890",
      alamat: "Jl. Sudirman No. 456, Bandung",
      catatan: "",
      // Legacy fields
      nama: "Ahmad Budiman",
      noTelepon: "081234567894",
    },
  ],
  kamar: [
    {
      id: "1",
      nomor: "101",
      tipeKamarId: "1",
      status: "Tersedia",
      lantai: 1,
      posisiLayout: null,
    },
    {
      id: "2",
      nomor: "102",
      tipeKamarId: "1",
      status: "Tersedia",
      lantai: 1,
      posisiLayout: null,
    },
    {
      id: "3",
      nomor: "103",
      tipeKamarId: "2",
      status: "Dibersihkan",
      lantai: 1,
      posisiLayout: null,
    },
    {
      id: "4",
      nomor: "104",
      tipeKamarId: "1",
      status: "Perbaikan",
      lantai: 1,
      posisiLayout: null,
    },
    {
      id: "5",
      nomor: "201",
      tipeKamarId: "2",
      status: "Dipesan",
      lantai: 2,
      posisiLayout: null,
    },
    {
      id: "6",
      nomor: "202",
      tipeKamarId: "2",
      status: "Tersedia",
      lantai: 2,
      posisiLayout: null,
    },
    {
      id: "7",
      nomor: "203",
      tipeKamarId: "3",
      status: "Tersedia",
      lantai: 2,
      posisiLayout: null,
    },
    {
      id: "8",
      nomor: "301",
      tipeKamarId: "3",
      status: "Tersedia",
      lantai: 3,
      posisiLayout: null,
    },
  ],
  pemesanan: [
    {
      id: "1",
      kodeBooking: "BOOK-20250115-001",
      tamuId: "1", // Rina Marlina
      kamarId: "5", // Room 201 (Deluxe)
      tanggalCheckIn: "2025-01-20",
      tanggalCheckOut: "2025-01-23",
      jumlahMalam: 3,
      totalBiaya: 2250000, // 3 nights x 750,000
      totalTerbayar: 750000, // DP
      sisaPembayaran: 1500000,
      statusPembayaran: "DP",
      statusPemesanan: "Confirmed",
      catatan: "Mohon kamar dengan pemandangan bagus",
      // Legacy fields
      customerId: "1",
      tipeKamarId: "2",
      totalHarga: 2250000,
      status: "Confirmed",
      tanggalPesan: "2025-01-15",
    },
  ],
  transaksi: [
    {
      id: "1",
      pemesananId: "1",
      tanggal: "2025-01-15",
      jenis: "Uang Muka",
      jumlah: 750000,
      metode: "Transfer Bank",
      // Legacy fields
      metodePembayaran: "Transfer",
      status: "Success",
      tanggalTransaksi: "2025-01-15",
    },
  ],
  layoutLantai: [
    { id: "layout-01", lantai: 1, gridKolom: 8, gridBaris: 4 },
    { id: "layout-02", lantai: 2, gridKolom: 8, gridBaris: 4 },
    { id: "layout-03", lantai: 3, gridKolom: 6, gridBaris: 3 },
  ],
};

export const useAppStore = create<AppState & AppActions>((set, get) => ({
  ...initialState,

  login: (email: string, password: string) => {
    const user = get().users.find(
      (u) => u.email === email && u.password === password
    );
    if (user) {
      set({ currentUser: user });
      return user;
    }
    return null;
  },

  logout: () => {
    set({ currentUser: null });
  },

  register: (userData) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      namaLengkap: userData.nama,
      role: userData.peran,
      status: "Aktif",
      tanggalDaftar: new Date().toISOString().split("T")[0],
    };
    set((state) => ({
      users: [...state.users, newUser],
      currentUser: newUser,
    }));
  },

  // Generate next staff code
  generateStaffCode: () => {
    const state = get();
    const staffUsers = state.users.filter((u) => u.kodePengguna);
    const maxCode = staffUsers.reduce((max, user) => {
      const codeNumber = parseInt(user.kodePengguna?.split("-")[1] || "0");
      return Math.max(max, codeNumber);
    }, 0);
    return `STF-${String(maxCode + 1).padStart(3, "0")}`;
  },

  // Add new staff user
  addStaffUser: (userData) => {
    const state = get();
    const kodePengguna = state.generateStaffCode();
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      kodePengguna,
      nama: userData.namaLengkap,
      role: userData.peran,
      status: "Aktif",
      tanggalDaftar: new Date().toISOString().split("T")[0],
    };
    set((state) => ({
      users: [...state.users, newUser],
    }));
  },

  // Update staff user
  updateStaffUser: (id, userData) => {
    set((state) => ({
      users: state.users.map((user) =>
        user.id === id
          ? {
              ...user,
              ...userData,
              nama: userData.namaLengkap || user.namaLengkap,
              role: userData.peran || user.role,
            }
          : user
      ),
      currentUser:
        state.currentUser && state.currentUser.id === id
          ? {
              ...state.currentUser,
              ...userData,
              nama: userData.namaLengkap || state.currentUser.namaLengkap,
              role: userData.peran || state.currentUser.role,
            }
          : state.currentUser,
    }));
  },

  // Delete staff user
  deleteStaffUser: (id) => {
    set((state) => ({
      users: state.users.filter((user) => user.id !== id),
    }));
  },

  // Toggle staff status
  toggleStaffStatus: (id) => {
    set((state) => ({
      users: state.users.map((user) =>
        user.id === id
          ? {
              ...user,
              status: user.status === "Aktif" ? "Tidak Aktif" : "Aktif",
            }
          : user
      ),
      currentUser:
        state.currentUser && state.currentUser.id === id
          ? {
              ...state.currentUser,
              status:
                state.currentUser.status === "Aktif" ? "Tidak Aktif" : "Aktif",
            }
          : state.currentUser,
    }));
  },

  // Reset staff password
  resetStaffPassword: (id) => {
    const newPassword = `Hotel@${new Date().getFullYear()}`;
    set((state) => ({
      users: state.users.map((user) =>
        user.id === id ? { ...user, password: newPassword } : user
      ),
      currentUser:
        state.currentUser && state.currentUser.id === id
          ? {
              ...state.currentUser,
              password: newPassword,
            }
          : state.currentUser,
    }));
    return newPassword;
  },

  // Generate next tipe kamar code
  generateTipeKamarCode: () => {
    const state = get();
    const maxCode = state.tipeKamar.reduce((max, tipe) => {
      const codeNumber = parseInt(tipe.kodeTipe.split("-")[1] || "0");
      return Math.max(max, codeNumber);
    }, 0);
    return `TK-${String(maxCode + 1).padStart(2, "0")}`;
  },

  // Check if tipe kamar can be deleted (not used by any room)
  canDeleteTipeKamar: (id) => {
    const state = get();
    return !state.kamar.some((kamar) => kamar.tipeKamarId === id);
  },

  addTipeKamar: (tipeKamar) => {
    const state = get();
    const kodeTipe = state.generateTipeKamarCode();
    const newTipeKamar: TipeKamar = {
      ...tipeKamar,
      id: Date.now().toString(),
      kodeTipe,
      // Add legacy fields for backward compatibility
      harga: tipeKamar.hargaDefault,
      fasilitas: [],
      gambar: [tipeKamar.fotoUrl],
    };
    set((state) => ({
      tipeKamar: [...state.tipeKamar, newTipeKamar],
    }));
  },

  updateTipeKamar: (id, tipeKamar) => {
    set((state) => ({
      tipeKamar: state.tipeKamar.map((tk) =>
        tk.id === id
          ? {
              ...tk,
              ...tipeKamar,
              // Update legacy fields for backward compatibility
              harga: tipeKamar.hargaDefault || tk.hargaDefault,
              gambar: tipeKamar.fotoUrl ? [tipeKamar.fotoUrl] : tk.gambar,
            }
          : tk
      ),
    }));
  },

  deleteTipeKamar: (id) => {
    const state = get();
    if (state.canDeleteTipeKamar(id)) {
      set((state) => ({
        tipeKamar: state.tipeKamar.filter((tk) => tk.id !== id),
      }));
      return true;
    }
    return false;
  },

  // Generate next booking code
  generateBookingCode: () => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    const state = get();
    const todayBookings = state.pemesanan.filter(
      (p) => p.kodeBooking && p.kodeBooking.includes(dateStr)
    );
    const maxNumber = todayBookings.reduce((max, booking) => {
      const parts = booking.kodeBooking.split("-");
      const number = parseInt(parts[parts.length - 1] || "0");
      return Math.max(max, number);
    }, 0);
    return `BOOK-${dateStr}-${String(maxNumber + 1).padStart(3, "0")}`;
  },

  // Calculate nights between dates
  calculateNights: (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  // Calculate total cost
  calculateTotalCost: (kamarId, nights) => {
    const state = get();
    const kamar = state.kamar.find((k) => k.id === kamarId);
    if (!kamar) return 0;
    const tipeKamar = state.tipeKamar.find((tk) => tk.id === kamar.tipeKamarId);
    if (!tipeKamar) return 0;
    return tipeKamar.hargaDefault * nights;
  },

  // Check room availability
  checkRoomAvailability: (kamarId, checkIn, checkOut, excludePemesananId) => {
    const state = get();
    const conflictingBookings = state.pemesanan.filter((p) => {
      if (p.id === excludePemesananId) return false;
      if (p.kamarId !== kamarId) return false;
      if (p.statusPemesanan === "Cancelled") return false;

      const bookingStart = new Date(p.tanggalCheckIn);
      const bookingEnd = new Date(p.tanggalCheckOut);
      const newStart = new Date(checkIn);
      const newEnd = new Date(checkOut);

      // Check for overlap
      return newStart < bookingEnd && newEnd > bookingStart;
    });

    return conflictingBookings.length === 0;
  },

  // Get available rooms for date range
  getAvailableRooms: (checkIn, checkOut, tipeKamarId) => {
    const state = get();
    let availableRooms = state.kamar.filter((kamar) => {
      // Filter by type if specified
      if (tipeKamarId && kamar.tipeKamarId !== tipeKamarId) return false;

      // Check if room is available for the date range
      return state.checkRoomAvailability(kamar.id, checkIn, checkOut);
    });

    return availableRooms;
  },

  addPemesanan: (pemesanan) => {
    const state = get();
    const kodeBooking = state.generateBookingCode();
    const newPemesanan: Pemesanan = {
      ...pemesanan,
      id: Date.now().toString(),
      kodeBooking,
      // Add legacy fields for backward compatibility
      customerId: pemesanan.tamuId,
      tipeKamarId:
        state.kamar.find((k) => k.id === pemesanan.kamarId)?.tipeKamarId || "",
      totalHarga: pemesanan.totalBiaya,
      status: "Confirmed",
      tanggalPesan: new Date().toISOString().split("T")[0],
    };

    set((state) => ({
      pemesanan: [...state.pemesanan, newPemesanan],
      // Update room status to 'Dipesan'
      kamar: state.kamar.map((k) =>
        k.id === pemesanan.kamarId ? { ...k, status: "Dipesan" } : k
      ),
    }));

    return newPemesanan.id;
  },

  updatePemesanan: (id, pemesanan) => {
    set((state) => ({
      pemesanan: state.pemesanan.map((p) =>
        p.id === id
          ? {
              ...p,
              ...pemesanan,
              // Update legacy fields for backward compatibility
              totalHarga: pemesanan.totalBiaya || p.totalBiaya,
              status:
                pemesanan.statusPemesanan === "Confirmed"
                  ? "Confirmed"
                  : pemesanan.statusPemesanan === "Checked-in"
                  ? "CheckedIn"
                  : pemesanan.statusPemesanan === "Checked-out"
                  ? "CheckedOut"
                  : pemesanan.statusPemesanan === "Cancelled"
                  ? "Cancelled"
                  : p.status,
            }
          : p
      ),
    }));
  },

  cancelPemesanan: (id) => {
    const state = get();
    const pemesanan = state.pemesanan.find((p) => p.id === id);
    if (!pemesanan) return;

    set((state) => ({
      pemesanan: state.pemesanan.map((p) =>
        p.id === id
          ? {
              ...p,
              statusPemesanan: "Cancelled",
              status: "Cancelled", // legacy field
            }
          : p
      ),
      // Update room status back to 'Tersedia'
      kamar: state.kamar.map((k) =>
        k.id === pemesanan.kamarId ? { ...k, status: "Tersedia" } : k
      ),
    }));
  },

  // Transaction management
  addTransaksi: (transaksi) => {
    const newTransaksi: Transaksi = {
      ...transaksi,
      id: Date.now().toString(),
      // Add legacy fields for backward compatibility
      metodePembayaran:
        transaksi.metode === "Transfer Bank"
          ? "Transfer"
          : transaksi.metode === "Kartu Kredit"
          ? "Card"
          : "Cash",
      status: "Success",
      tanggalTransaksi: transaksi.tanggal,
    };

    set((state) => ({
      transaksi: [...state.transaksi, newTransaksi],
    }));
  },

  getTransaksiByPemesanan: (pemesananId) => {
    const state = get();
    return state.transaksi.filter((t) => t.pemesananId === pemesananId);
  },

  // Generate next tamu code
  generateTamuCode: () => {
    const state = get();
    const maxCode = state.tamu.reduce((max, tamu) => {
      const codeNumber = parseInt(tamu.kodeTamu.split("-")[1] || "0");
      return Math.max(max, codeNumber);
    }, 0);
    return `TAMU-${String(maxCode + 1).padStart(3, "0")}`;
  },

  // Check if tamu can be deleted (not used by any booking)
  canDeleteTamu: (id) => {
    const state = get();
    return !state.pemesanan.some((pemesanan) => pemesanan.tamuId === id);
  },

  addTamu: (tamu) => {
    const state = get();
    const kodeTamu = state.generateTamuCode();
    const newTamu: Tamu = {
      ...tamu,
      id: Date.now().toString(),
      kodeTamu,
      // Add legacy fields for backward compatibility
      nama: tamu.namaLengkap,
      noTelepon: tamu.telepon,
    };
    set((state) => ({
      tamu: [...state.tamu, newTamu],
    }));
  },

  updateTamu: (id, tamu) => {
    set((state) => ({
      tamu: state.tamu.map((t) =>
        t.id === id
          ? {
              ...t,
              ...tamu,
              // Update legacy fields for backward compatibility
              nama: tamu.namaLengkap || t.namaLengkap,
              noTelepon: tamu.telepon || t.telepon,
            }
          : t
      ),
    }));
  },

  deleteTamu: (id) => {
    const state = get();
    if (state.canDeleteTamu(id)) {
      set((state) => ({
        tamu: state.tamu.filter((t) => t.id !== id),
      }));
      return true;
    }
    return false;
  },

  // Room management actions
  updateRoomStatus: (id, status) => {
    set((state) => ({
      kamar: state.kamar.map((k) => (k.id === id ? { ...k, status } : k)),
    }));
  },

  canUpdateRoomStatus: (id, newStatus) => {
    const state = get();
    const room = state.kamar.find((k) => k.id === id);
    if (!room) return false;

    // Cannot change status if room is booked (Dipesan)
    if (room.status === "Dipesan") return false;

    return true;
  },

  getAvailableStatusOptions: (currentStatus) => {
    switch (currentStatus) {
      case "Tersedia":
        return ["Tersedia", "Perbaikan"];
      case "Dipesan":
        return ["Dipesan"]; // Cannot change booked rooms
      case "Dibersihkan":
        return ["Dibersihkan", "Tersedia"];
      case "Perbaikan":
        return ["Perbaikan", "Dibersihkan"];
      default:
        return ["Tersedia", "Dibersihkan", "Perbaikan"];
    }
  },

  // Layout management actions (Admin only)
  updateLayoutLantai: (lantai, gridKolom, gridBaris) => {
    set((state) => ({
      layoutLantai: state.layoutLantai.map((layout) =>
        layout.lantai === lantai ? { ...layout, gridKolom, gridBaris } : layout
      ),
    }));
  },

  updateRoomPosition: (roomId, lantai, posisiLayout) => {
    set((state) => ({
      kamar: state.kamar.map((k) =>
        k.id === roomId ? { ...k, lantai, posisiLayout } : k
      ),
    }));
  },

  getLayoutForFloor: (lantai) => {
    const state = get();
    return state.layoutLantai.find((layout) => layout.lantai === lantai);
  },

  getRoomsForFloor: (lantai) => {
    const state = get();
    return state.kamar.filter((k) => k.lantai === lantai);
  },

  getUnpositionedRoomsForFloor: (lantai) => {
    const state = get();
    return state.kamar.filter(
      (k) => k.lantai === lantai && k.posisiLayout === null
    );
  },
}));
