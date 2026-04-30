import React from "react";
import { useGetDashboardSummary, useGetRecentAttendance, useListAttendance } from "@/lib/hooks";
import { photoUrl } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle2, Clock, CalendarDays, BarChart3, Image as ImageIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/status-badge";
import { format, subDays } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export default function AdminDashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: recent, isLoading: isLoadingRecent } = useGetRecentAttendance();
  const { data: allAttendance } = useListAttendance();

  // Compute chart data for last 7 days
  const chartData = React.useMemo(() => {
    if (!allAttendance) return [];
    
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = subDays(new Date(), 6 - i);
      const dateStr = format(d, "yyyy-MM-dd");
      return {
        dateStr,
        name: format(d, "EEE", { locale: idLocale }),
        Hadir: 0,
        Terlambat: 0,
        Izin: 0
      };
    });

    allAttendance.forEach(record => {
      const day = days.find(d => d.dateStr === record.date);
      if (day) {
        if (record.status === "hadir") day.Hadir++;
        if (record.status === "terlambat") day.Terlambat++;
        if (record.status === "izin") day.Izin++;
      }
    });

    return days;
  }, [allAttendance]);

  const StatCard = ({ title, value, icon: Icon, className }: any) => (
    <Card className="overflow-hidden border-border relative">
      <div className={`absolute top-0 right-0 p-4 opacity-10 ${className}`}>
        <Icon className="w-16 h-16" />
      </div>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`w-4 h-4 ${className}`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{isLoadingSummary ? <Skeleton className="h-8 w-16" /> : value}</div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dasbor Admin</h1>
        <p className="text-muted-foreground mt-1">Ringkasan aktivitas presensi pegawai hari ini.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Total Pegawai" value={summary?.totalEmployees || 0} icon={Users} className="text-blue-500" />
        <StatCard title="Hadir Hari Ini" value={summary?.presentToday || 0} icon={CheckCircle2} className="text-emerald-500" />
        <StatCard title="Terlambat" value={summary?.lateToday || 0} icon={Clock} className="text-amber-500" />
        <StatCard title="Izin" value={summary?.absentToday || summary?.onLeaveToday || 0} icon={CalendarDays} className="text-purple-500" />
        <StatCard title="Total Minggu Ini" value={summary?.totalThisWeek || 0} icon={BarChart3} className="text-primary" />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="border-border/60 shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Aktivitas Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            {isLoadingRecent ? (
              <div className="p-6 space-y-4">
                {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
              </div>
            ) : recent && recent.length > 0 ? (
              <div className="divide-y divide-border/50">
                {recent.slice(0, 6).map((record) => (
                  <div key={record.id} className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {record.employeeName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm text-foreground">{record.employeeName}</p>
                        <p className="text-xs text-muted-foreground">{record.position}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <StatusBadge status={record.status} />
                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                          {record.checkInAt ? format(new Date(record.checkInAt), "HH:mm") : "-"}
                        </p>
                      </div>
                      {record.checkInPhoto && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-border cursor-pointer hover:ring-2 ring-primary/50 transition-all">
                              <img src={photoUrl(record.checkInPhoto)} alt="Selfie" className="w-full h-full object-cover" />
                            </div>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md bg-transparent border-none shadow-none">
                            <img src={photoUrl(record.checkInPhoto)} alt="Selfie Full" className="w-full h-auto rounded-xl border-4 border-white shadow-2xl" />
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                <ImageIcon className="w-12 h-12 text-muted mb-3" />
                <p>Belum ada aktivitas hari ini</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Tren Presensi 7 Hari Terakhir
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-6">
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                    allowDecimals={false}
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--secondary))' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="Hadir" stackId="a" fill="hsl(160 60% 45%)" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="Terlambat" stackId="a" fill="hsl(35 90% 50%)" />
                  <Bar dataKey="Izin" stackId="a" fill="hsl(210 60% 60%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
