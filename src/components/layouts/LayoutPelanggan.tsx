import { Outlet, Link, useLocation } from "react-router-dom";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Home, Package, LogIn, User, ListOrdered, LogOut } from "lucide-react";

export default function LayoutPelanggan() {
  const { currentUser, logout } = useAppStore();
  const location = useLocation();

  const navigationItems = currentUser
    ? [
        { icon: Home, label: "Beranda", href: "/" },
        { icon: Package, label: "Paket", href: "/paket" },
        { icon: ListOrdered, label: "Pesanan", href: "/akun/pesanan-saya" },
        { icon: User, label: "Profil", href: "/akun/profil-saya" },
      ]
    : [
        { icon: Home, label: "Beranda", href: "/" },
        { icon: Package, label: "Paket", href: "/paket" },
        { icon: LogIn, label: "Login", href: "/login" },
      ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="text-xl font-bold text-primary">
            Baru Taraje
          </Link>
          {currentUser && (
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-muted-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="flex items-center justify-around px-2 py-2">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-0 flex-1 ${
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
