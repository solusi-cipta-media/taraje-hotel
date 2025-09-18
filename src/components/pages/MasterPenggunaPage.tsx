import { useState, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Plus,
  Search,
  Edit,
  RotateCcw,
  Power,
  Eye,
  EyeOff,
  Users,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";

interface UserFormData {
  namaLengkap: string;
  email: string;
  telepon: string;
  peran: "Admin" | "Resepsionis";
  password: string;
}

export default function MasterPenggunaPage() {
  const {
    users,
    currentUser,
    addStaffUser,
    updateStaffUser,
    toggleStaffStatus,
    resetStaffPassword,
    generateStaffCode,
  } = useAppStore();

  // Access control - hanya Admin yang bisa akses halaman ini
  if (!currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  if (currentUser.peran !== "Admin" && currentUser.role !== "Admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // Filter untuk staff only (Admin & Resepsionis)
  const staffUsers = users.filter(
    (user) => user.peran === "Admin" || user.peran === "Resepsionis"
  );

  // State untuk filtering dan pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<
    "Semua" | "Admin" | "Resepsionis"
  >("Semua");
  const [statusFilter, setStatusFilter] = useState<
    "Semua" | "Aktif" | "Tidak Aktif"
  >("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // State untuk modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] =
    useState(false);
  const [isPasswordResultModalOpen, setIsPasswordResultModalOpen] =
    useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [resetUser, setResetUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");

  // State untuk form
  const [formData, setFormData] = useState<UserFormData>({
    namaLengkap: "",
    email: "",
    telepon: "",
    peran: "Resepsionis",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);

  // Filtered data berdasarkan pencarian dan filter
  const filteredUsers = useMemo(() => {
    return staffUsers.filter((user) => {
      const matchesSearch =
        user.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "Semua" || user.peran === roleFilter;
      const matchesStatus =
        statusFilter === "Semua" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [staffUsers, searchTerm, roleFilter, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Reset form
  const resetForm = () => {
    setFormData({
      namaLengkap: "",
      email: "",
      telepon: "",
      peran: "Resepsionis",
      password: "",
    });
    setShowPassword(false);
  };

  // Validasi form
  const isFormValid = () => {
    return (
      formData.namaLengkap.trim() !== "" &&
      formData.email.trim() !== "" &&
      /\S+@\S+\.\S+/.test(formData.email) &&
      (isEditModalOpen ? true : formData.password.trim() !== "")
    ); // Password wajib untuk add, opsional untuk edit
  };

  // Check email uniqueness
  const isEmailUnique = (email: string, excludeId?: string) => {
    return !users.some((user) => user.email === email && user.id !== excludeId);
  };

  // Handle tambah pengguna
  const handleAddUser = () => {
    if (!isFormValid()) {
      toast.error("Mohon lengkapi semua field yang wajib diisi");
      return;
    }

    if (!isEmailUnique(formData.email)) {
      toast.error("Email ini sudah terdaftar. Silakan gunakan email lain.");
      return;
    }

    addStaffUser({
      ...formData,
      nama: formData.namaLengkap,
      role: formData.peran,
      status: "Aktif", // Default status for new users
    });
    toast.success(`Pengguna '${formData.namaLengkap}' berhasil ditambahkan`);
    setIsAddModalOpen(false);
    resetForm();
  };

  // Handle edit pengguna
  const handleEditUser = () => {
    if (!editingUser) return;

    if (!isFormValid()) {
      toast.error("Mohon lengkapi semua field yang wajib diisi");
      return;
    }

    if (!isEmailUnique(formData.email, editingUser.id)) {
      toast.error("Email ini sudah terdaftar. Silakan gunakan email lain.");
      return;
    }

    const updateData: any = {
      namaLengkap: formData.namaLengkap,
      email: formData.email,
      telepon: formData.telepon,
      peran: formData.peran,
    };

    // Hanya update password jika diisi
    if (formData.password.trim() !== "") {
      updateData.password = formData.password;
    }

    updateStaffUser(editingUser.id, updateData);
    toast.success(
      `Data pengguna '${formData.namaLengkap}' berhasil diperbarui`
    );
    setIsEditModalOpen(false);
    setEditingUser(null);
    resetForm();
  };

  // Handle reset password
  const handleResetPassword = () => {
    if (!resetUser) return;

    const newPwd = resetStaffPassword(resetUser.id);
    setNewPassword(newPwd);
    setIsResetPasswordModalOpen(false);
    setIsPasswordResultModalOpen(true);
    toast.success(
      `Password untuk '${resetUser.namaLengkap}' berhasil di-reset`
    );
  };

  // Handle toggle status
  const handleToggleStatus = (user: any) => {
    // Jangan bisa toggle status diri sendiri
    if (currentUser && currentUser.id === user.id) {
      toast.error("Anda tidak dapat menonaktifkan akun Anda sendiri");
      return;
    }

    toggleStaffStatus(user.id);
    const newStatus = user.status === "Aktif" ? "Tidak Aktif" : "Aktif";
    toast.success(
      `Status pengguna '${user.namaLengkap}' berhasil diubah menjadi ${newStatus}`
    );
  };

  // Handle copy password
  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(newPassword);
      setPasswordCopied(true);
      toast.success("Password berhasil disalin");
      setTimeout(() => setPasswordCopied(false), 2000);
    } catch (err) {
      toast.error("Gagal menyalin password");
    }
  };

  // Open edit modal
  const openEditModal = (user: any) => {
    setEditingUser(user);
    setFormData({
      namaLengkap: user.namaLengkap,
      email: user.email,
      telepon: user.telepon || "",
      peran: user.peran,
      password: "",
    });
    setIsEditModalOpen(true);
  };

  // Open reset password modal
  const openResetPasswordModal = (user: any) => {
    setResetUser(user);
    setIsResetPasswordModalOpen(true);
  };

  // Role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Resepsionis":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Aktif":
        return "bg-green-100 text-green-800 border-green-200";
      case "Tidak Aktif":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Check if user can be edited/disabled (not current user)
  const canModifyUser = (user: any) => {
    return currentUser && user && currentUser.id !== user.id;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manajemen Pengguna Sistem
          </div>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  resetForm();
                  setIsAddModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Pengguna Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Tambah Pengguna Baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="kodePengguna">Kode Pengguna</Label>
                  <Input
                    id="kodePengguna"
                    value={generateStaffCode()}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="namaLengkap">Nama Lengkap *</Label>
                  <Input
                    id="namaLengkap"
                    placeholder="Masukkan nama lengkap"
                    value={formData.namaLengkap}
                    onChange={(e) =>
                      setFormData({ ...formData, namaLengkap: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Masukkan email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                  {formData.email && !isEmailUnique(formData.email) && (
                    <p className="text-sm text-red-500">
                      Email ini sudah terdaftar. Silakan gunakan email lain.
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telepon">Nomor Telepon</Label>
                  <Input
                    id="telepon"
                    placeholder="Masukkan nomor telepon"
                    value={formData.telepon}
                    onChange={(e) =>
                      setFormData({ ...formData, telepon: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="peran">Peran *</Label>
                  <Select
                    value={formData.peran}
                    onValueChange={(value: "Admin" | "Resepsionis") =>
                      setFormData({ ...formData, peran: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Resepsionis">Resepsionis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      resetForm();
                    }}
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={handleAddUser}
                    disabled={!isFormValid() || !isEmailUnique(formData.email)}
                  >
                    Simpan Perubahan
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filter dan Pencarian */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari berdasarkan nama atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={roleFilter}
            onValueChange={(value: "Semua" | "Admin" | "Resepsionis") =>
              setRoleFilter(value)
            }
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Semua">Semua Peran</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Resepsionis">Resepsionis</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(value: "Semua" | "Aktif" | "Tidak Aktif") =>
              setStatusFilter(value)
            }
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Semua">Semua Status</SelectItem>
              <SelectItem value="Aktif">Aktif</SelectItem>
              <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Show Entries */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Tampilkan</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => setItemsPerPage(Number(value))}
            >
              <SelectTrigger className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">entri</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Menampilkan {startIndex + 1} sampai{" "}
            {Math.min(startIndex + itemsPerPage, filteredUsers.length)} dari{" "}
            {filteredUsers.length} entri
          </div>
        </div>

        {/* Tabel Pengguna */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama Lengkap</TableHead>
                <TableHead>Email & Telepon</TableHead>
                <TableHead>Peran</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-8"
                  >
                    Tidak ada data pengguna yang ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.kodePengguna}
                    </TableCell>
                    <TableCell>{user.namaLengkap}</TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{user.email}</div>
                        {user.telepon && (
                          <div className="text-xs text-muted-foreground">
                            {user.telepon}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getRoleBadgeColor(user.peran)}
                      >
                        {user.peran}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusBadgeColor(user.status)}
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(user)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openResetPasswordModal(user)}
                          className="h-8 w-8 p-0"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(user)}
                          disabled={!canModifyUser(user)}
                          className="h-8 w-8 p-0"
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                Edit Data Pengguna: {editingUser?.namaLengkap}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editKodePengguna">Kode Pengguna</Label>
                <Input
                  id="editKodePengguna"
                  value={editingUser?.kodePengguna || ""}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editNamaLengkap">Nama Lengkap *</Label>
                <Input
                  id="editNamaLengkap"
                  placeholder="Masukkan nama lengkap"
                  value={formData.namaLengkap}
                  onChange={(e) =>
                    setFormData({ ...formData, namaLengkap: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editEmail">Email *</Label>
                <Input
                  id="editEmail"
                  type="email"
                  placeholder="Masukkan email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                {formData.email &&
                  !isEmailUnique(formData.email, editingUser?.id) && (
                    <p className="text-sm text-red-500">
                      Email ini sudah terdaftar. Silakan gunakan email lain.
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="editTelepon">Nomor Telepon</Label>
                <Input
                  id="editTelepon"
                  placeholder="Masukkan nomor telepon"
                  value={formData.telepon}
                  onChange={(e) =>
                    setFormData({ ...formData, telepon: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPeran">Peran *</Label>
                <Select
                  value={formData.peran}
                  onValueChange={(value: "Admin" | "Resepsionis") =>
                    setFormData({ ...formData, peran: value })
                  }
                  disabled={!canModifyUser(editingUser)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Resepsionis">Resepsionis</SelectItem>
                  </SelectContent>
                </Select>
                {!canModifyUser(editingUser) && (
                  <p className="text-xs text-muted-foreground">
                    Anda tidak dapat mengubah peran akun Anda sendiri
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPassword">Password</Label>
                <div className="relative">
                  <Input
                    id="editPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Kosongkan jika tidak ingin mengubah password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingUser(null);
                    resetForm();
                  }}
                >
                  Batal
                </Button>
                <Button
                  onClick={handleEditUser}
                  disabled={
                    !isFormValid() ||
                    !isEmailUnique(formData.email, editingUser?.id)
                  }
                >
                  Simpan Perubahan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reset Password Confirmation Modal */}
        <AlertDialog
          open={isResetPasswordModalOpen}
          onOpenChange={setIsResetPasswordModalOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset Password</AlertDialogTitle>
              <AlertDialogDescription>
                Anda yakin ingin me-reset password untuk{" "}
                <strong>{resetUser?.namaLengkap}</strong>? Password baru akan
                dibuat secara otomatis.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setIsResetPasswordModalOpen(false);
                  setResetUser(null);
                }}
              >
                Batal
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleResetPassword}>
                Ya, Reset Password
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Password Result Modal */}
        <Dialog
          open={isPasswordResultModalOpen}
          onOpenChange={setIsPasswordResultModalOpen}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Password Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Password baru untuk <strong>{resetUser?.namaLengkap}</strong>{" "}
                adalah:
              </p>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <code className="flex-1 text-sm font-mono">{newPassword}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyPassword}
                  className="h-8 w-8 p-0"
                >
                  {passwordCopied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  onClick={() => {
                    setIsPasswordResultModalOpen(false);
                    setResetUser(null);
                    setNewPassword("");
                    setPasswordCopied(false);
                  }}
                >
                  Tutup
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
