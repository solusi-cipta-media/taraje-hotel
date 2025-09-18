import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogIn, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAppStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const user = login(email, password);
      if (user) {
        toast.success(`Selamat datang, ${user.nama}!`);

        // Redirect based on role
        if (user.role === "Admin" || user.role === "Resepsionis") {
          navigate("/dashboard");
        } else {
          navigate("/");
        }
      } else {
        setError("Email atau password tidak valid");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <LogIn className="h-12 w-12 mx-auto text-primary" />
        <h1 className="text-2xl font-bold">Masuk ke Akun</h1>
        <p className="text-muted-foreground">Masuk untuk mengakses akun Anda</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="masukkan@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
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

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sedang masuk..." : "Masuk"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-center text-muted-foreground">
            Belum punya akun?{" "}
            <Link to="/daftar" className="text-primary hover:underline">
              Daftar sekarang
            </Link>
          </p>
        </CardContent>
      </Card>

      {/* Demo Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Akun Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="space-y-1">
            <p className="font-medium">Admin:</p>
            <p>Email: admin@barutaraje.com</p>
            <p>Password: admin123</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium">Resepsionis:</p>
            <p>Email: resepsionis@barutaraje.com</p>
            <p>Password: resepsionis123</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium">Customer:</p>
            <p>Email: john@email.com</p>
            <p>Password: customer123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
