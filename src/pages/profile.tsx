import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, User as UserIcon, Building2, MapPin, Mail, Phone } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Profil Saya</h1>
        <p className="text-muted-foreground mt-1">Informasi detail akun dan identitas pegawai Anda.</p>
      </div>

      <Card className="border-border/60 shadow-lg overflow-hidden rounded-2xl relative">
        {/* Background decorative header */}
        <div className="h-32 bg-gradient-to-r from-primary to-primary/60 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        </div>
        
        <CardContent className="pt-0 relative px-6 sm:px-10 pb-10">
          <div className="flex flex-col sm:flex-row gap-6 sm:items-end -mt-16 mb-8">
            <Avatar className="h-32 w-32 border-4 border-card shadow-xl bg-card">
              <AvatarImage src={user.photoUrl || ""} />
              <AvatarFallback className="bg-primary/10 text-primary text-4xl font-bold">
                {user.fullName?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1 mb-2 flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold">{user.fullName}</h2>
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                  {user.role === 'admin' ? <ShieldAlert className="w-3 h-3 mr-1" /> : <UserIcon className="w-3 h-3 mr-1" />}
                  {user.role}
                </Badge>
              </div>
              <p className="text-muted-foreground text-lg">@{user.username}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6 bg-secondary/20 p-6 rounded-2xl border border-border/50">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Posisi
              </p>
              <p className="text-lg font-medium">{user.position || "-"}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4" /> Departemen
              </p>
              <p className="text-lg font-medium">{user.department || "-"}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email
              </p>
              <p className="text-lg font-medium">{"-"}</p> {/* Currently API doesn't return email in AuthUser, fallback to dash */}
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Phone className="w-4 h-4" /> Telepon
              </p>
              <p className="text-lg font-medium">{"-"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
