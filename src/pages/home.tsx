import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { photoUrl } from "@/lib/api";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { 
  useGetMyAttendanceToday, 
  getGetMyAttendanceTodayQueryKey,
  useCheckIn,
  useCheckOut,
  useListAttendance,
  getListAttendanceQueryKey
} from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WebcamCapture } from "@/components/webcam-capture";
import { StatusBadge } from "@/components/status-badge";
import { MapPin, Clock, LogIn, LogOut, CalendarDays, Loader2 } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function Home() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);

  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

  const { data: todayAttendance, isLoading: isLoadingToday } = useGetMyAttendanceToday({
    query: {
      queryKey: getGetMyAttendanceTodayQueryKey(),
    }
  });

  const { data: recentAttendance } = useListAttendance({
    employeeId: user?.employeeId ?? user?.id
  }, {
    query: {
      queryKey: getListAttendanceQueryKey({ employeeId: user?.employeeId ?? user?.id })
    }
  });

  useEffect(() => {
    if (user?.role === "admin") {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = (dataUrl: string) => {
    checkInMutation.mutate({ data: { photo: dataUrl } }, {
      onSuccess: () => {
        toast.success("Absen masuk berhasil. Selamat bekerja!");
        queryClient.invalidateQueries({ queryKey: getGetMyAttendanceTodayQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListAttendanceQueryKey({ employeeId: user?.employeeId ?? user?.id }) });
      },
      onError: (error: any) => {
        toast.error(`Gagal absen: ${error?.error || "Terjadi kesalahan"}`);
      }
    });
  };

  const handleCheckOut = (dataUrl: string) => {
    checkOutMutation.mutate({ data: { photo: dataUrl } }, {
      onSuccess: () => {
        toast.success("Absen pulang berhasil. Hati-hati di jalan!");
        queryClient.invalidateQueries({ queryKey: getGetMyAttendanceTodayQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListAttendanceQueryKey({ employeeId: user?.employeeId ?? user?.id }) });
      },
      onError: (error: any) => {
        toast.error(`Gagal absen: ${error?.error || "Terjadi kesalahan"}`);
      }
    });
  };

  if (user?.role === "admin") return null;

  const hasCheckedIn = todayAttendance?.hasRecord && todayAttendance.record?.checkInAt;
  const hasCheckedOut = todayAttendance?.hasRecord && todayAttendance.record?.checkOutAt;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <Card className="bg-primary text-primary-foreground overflow-hidden border-none shadow-lg">
        <CardContent className="p-8 relative">
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
            <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="#ffffff" d="M45.7,-76.3C58.9,-69.3,69,-55.4,75.2,-40.5C81.4,-25.6,83.7,-9.7,81.4,5.4C79.1,20.5,72.2,34.8,62.8,47C53.4,59.2,41.4,69.4,27.1,75.1C12.8,80.8,-3.8,82.1,-19.5,78.2C-35.2,74.3,-50,65.2,-61.4,52.3C-72.8,39.4,-80.8,22.7,-83.4,5.3C-86,-12.1,-83.2,-30.1,-74.1,-44.6C-65,-59.1,-49.6,-70.1,-33.7,-75.7C-17.8,-81.3,-1.4,-81.5,14.2,-79.1C29.8,-76.7,45.7,-76.3,45.7,-76.3Z" transform="translate(100 100) scale(1.1)" />
            </svg>
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Selamat Datang, {user?.fullName}</h1>
              <p className="text-primary-foreground/80 flex items-center gap-2 text-lg">
                <MapPin className="w-5 h-5" />
                {user?.position} • {user?.department}
              </p>
            </div>
            <div className="text-left md:text-right bg-black/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
              <div className="text-4xl font-mono font-bold tracking-tight mb-1">
                {format(currentTime, "HH:mm:ss")} <span className="text-xl">WIB</span>
              </div>
              <div className="text-primary-foreground/90 font-medium flex items-center gap-2 justify-start md:justify-end">
                <CalendarDays className="w-4 h-4" />
                {format(currentTime, "EEEE, dd MMMM yyyy", { locale: idLocale })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoadingToday ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className={`border-2 transition-all ${hasCheckedIn ? 'border-border bg-secondary/30' : 'border-primary shadow-md hover:shadow-lg'}`}>
            <CardContent className="p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${hasCheckedIn ? 'bg-secondary text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                    <LogIn className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-foreground">Absen Masuk</h3>
                    <p className="text-sm text-muted-foreground">Catat jam kedatangan</p>
                  </div>
                </div>
                {todayAttendance?.record?.status && (
                  <StatusBadge status={todayAttendance.record.status} />
                )}
              </div>
              
              <div className="flex-1 flex flex-col justify-center mb-6">
                {hasCheckedIn ? (
                  <div className="flex items-center gap-4 bg-background p-4 rounded-xl border">
                    {todayAttendance.record?.checkInPhoto ? (
                      <img src={photoUrl(todayAttendance.record.checkInPhoto)} alt="Selfie" className="w-16 h-16 rounded-lg object-cover border" />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center">
                        <Clock className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Waktu Masuk</p>
                      <p className="text-2xl font-bold">{format(new Date(todayAttendance.record!.checkInAt!), "HH:mm")}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-6 bg-secondary/50 rounded-xl border border-dashed">
                    <p className="text-muted-foreground">Anda belum melakukan absen masuk hari ini</p>
                  </div>
                )}
              </div>

              <Button 
                size="lg" 
                className="w-full text-lg h-14 rounded-xl font-semibold"
                disabled={!!hasCheckedIn || checkInMutation.isPending}
                onClick={() => setIsCheckInOpen(true)}
              >
                {checkInMutation.isPending ? "Memproses..." : hasCheckedIn ? "Sudah Absen Masuk" : "Absen Masuk Sekarang"}
              </Button>
            </CardContent>
          </Card>

          <Card className={`border-2 transition-all ${!hasCheckedIn ? 'opacity-70 pointer-events-none' : hasCheckedOut ? 'border-border bg-secondary/30' : 'border-primary shadow-md hover:shadow-lg'}`}>
            <CardContent className="p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${hasCheckedOut ? 'bg-secondary text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                    <LogOut className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-foreground">Absen Pulang</h3>
                    <p className="text-sm text-muted-foreground">Catat jam kepulangan</p>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col justify-center mb-6">
                {hasCheckedOut ? (
                  <div className="flex items-center gap-4 bg-background p-4 rounded-xl border">
                    {todayAttendance.record?.checkOutPhoto ? (
                      <img src={photoUrl(todayAttendance.record.checkOutPhoto)} alt="Selfie" className="w-16 h-16 rounded-lg object-cover border" />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center">
                        <Clock className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Waktu Pulang</p>
                      <p className="text-2xl font-bold">{format(new Date(todayAttendance.record!.checkOutAt!), "HH:mm")}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-6 bg-secondary/50 rounded-xl border border-dashed">
                    <p className="text-muted-foreground">
                      {!hasCheckedIn ? "Lakukan absen masuk terlebih dahulu" : "Anda belum melakukan absen pulang hari ini"}
                    </p>
                  </div>
                )}
              </div>

              <Button 
                size="lg" 
                className="w-full text-lg h-14 rounded-xl font-semibold"
                disabled={!hasCheckedIn || !!hasCheckedOut || checkOutMutation.isPending}
                onClick={() => setIsCheckOutOpen(true)}
              >
                {checkOutMutation.isPending ? "Memproses..." : hasCheckedOut ? "Sudah Absen Pulang" : "Absen Pulang Sekarang"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-4 pt-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Riwayat Presensi Saya
        </h3>
        
        {recentAttendance && recentAttendance.length > 0 ? (
          <ScrollArea className="w-full whitespace-nowrap pb-4">
            <div className="flex w-max space-x-4 px-1">
              {recentAttendance.slice(0, 7).map((record) => (
                <Card key={record.id} className="w-[280px] shrink-0 border border-border/50 bg-card hover:bg-accent/5 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <p className="font-semibold text-foreground">
                        {format(new Date(record.date), "dd MMM yyyy", { locale: idLocale })}
                      </p>
                      <StatusBadge status={record.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-secondary/50 p-2 rounded-lg">
                        <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                          <LogIn className="w-3 h-3" /> Masuk
                        </p>
                        <p className="font-medium">{record.checkInAt ? format(new Date(record.checkInAt), "HH:mm") : "-"}</p>
                      </div>
                      <div className="bg-secondary/50 p-2 rounded-lg">
                        <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                          <LogOut className="w-3 h-3" /> Pulang
                        </p>
                        <p className="font-medium">{record.checkOutAt ? format(new Date(record.checkOutAt), "HH:mm") : "-"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        ) : (
          <Card className="border-dashed bg-transparent">
            <CardContent className="p-8 text-center text-muted-foreground">
              Belum ada riwayat presensi yang dapat ditampilkan.
            </CardContent>
          </Card>
        )}
      </div>

      <WebcamCapture 
        open={isCheckInOpen} 
        onOpenChange={setIsCheckInOpen} 
        onCapture={handleCheckIn}
        title="Absen Masuk"
        description="Posisikan wajah Anda pada bingkai untuk memverifikasi kehadiran"
      />
      <WebcamCapture 
        open={isCheckOutOpen} 
        onOpenChange={setIsCheckOutOpen} 
        onCapture={handleCheckOut}
        title="Absen Pulang"
        description="Posisikan wajah Anda pada bingkai untuk memverifikasi kepulangan"
      />
    </div>
  );
}
