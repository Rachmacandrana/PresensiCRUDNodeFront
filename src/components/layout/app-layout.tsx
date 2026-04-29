import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLogout } from "@/lib/hooks";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  User,
  LogOut,
  Menu,
  Droplets,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [location] = useLocation();
  const logout = useLogout();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        window.location.href = "/login";
      }
    });
  };

  const navItems = [
    {
      title: "Beranda",
      href: "/",
      icon: Home,
      roles: ["employee"],
    },
    {
      title: "Dasbor",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["admin"],
    },
    {
      title: "Manajemen Pegawai",
      href: "/employees",
      icon: Users,
      roles: ["admin"],
    },
    {
      title: "Riwayat Presensi",
      href: "/attendance",
      icon: ClipboardList,
      roles: ["admin"],
    },
    {
      title: "Profil Saya",
      href: "/profile",
      icon: User,
      roles: ["admin", "employee"],
    },
  ];

  const filteredNavItems = navItems.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  const NavLinks = () => (
    <nav className="flex-1 space-y-2 p-4">
      {filteredNavItems.map((item) => {
        const isActive = location === item.href;
        return (
          <Link key={item.href} href={item.href}>
            <div
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground font-medium"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );

  const UserInfo = () => (
    <div className="p-4 mt-auto">
      <div className="flex items-center space-x-3 p-3 bg-secondary/50 rounded-xl mb-4 border border-secondary">
        <Avatar className="h-10 w-10 border border-primary/20">
          <AvatarImage src={user?.photoUrl || ""} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {user?.fullName?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate text-foreground">{user?.fullName}</p>
          <p className="text-xs text-muted-foreground capitalize truncate">{user?.role}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl h-12"
        onClick={handleLogout}
        disabled={logout.isPending}
      >
        <LogOut className="mr-3 h-5 w-5" />
        Keluar
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col bg-card border-r border-border shadow-sm relative z-10">
        <div className="h-20 flex items-center px-8 border-b border-border/50">
          <div className="flex items-center gap-2 text-primary">
            <Droplets className="h-8 w-8" />
            <span className="font-bold text-xl tracking-tight">Presensi<span className="text-foreground">Aqua</span></span>
          </div>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden pt-4">
          <NavLinks />
        </div>
        <UserInfo />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background/50">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 flex items-center justify-between px-4 bg-card border-b border-border z-10">
          <div className="flex items-center gap-2 text-primary">
             <Droplets className="h-6 w-6" />
             <span className="font-bold text-lg tracking-tight">PresensiAqua</span>
          </div>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 flex flex-col bg-card border-r-0">
              <div className="h-20 flex items-center px-8 border-b border-border/50">
                <div className="flex items-center gap-2 text-primary">
                  <Droplets className="h-8 w-8" />
                  <span className="font-bold text-xl tracking-tight">Presensi<span className="text-foreground">Aqua</span></span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto pt-4">
                <NavLinks />
              </div>
              <UserInfo />
            </SheetContent>
          </Sheet>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
