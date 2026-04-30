import React, { useState } from "react";
import { useListAttendance, useListEmployees } from "@/lib/hooks";
import { photoUrl } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { StatusBadge } from "@/components/status-badge";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Filter, RefreshCcw, Image as ImageIcon, MapPin, Clock, CalendarDays } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AttendanceHistory() {
  const [dateFilter, setDateFilter] = useState<string>("");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  const { data: employees } = useListEmployees();
  
  const { data: attendance, isLoading } = useListAttendance({
    date: dateFilter || undefined,
    employeeId: employeeFilter !== "all" ? Number(employeeFilter) : undefined
  });

  const handleReset = () => {
    setDateFilter("");
    setEmployeeFilter("all");
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Riwayat Presensi</h1>
        <p className="text-muted-foreground mt-1">Pantau dan filter riwayat kehadiran seluruh pegawai.</p>
      </div>

      <Card className="border-border/60 shadow-sm">
        <div className="p-4 border-b border-border/50 bg-secondary/20 flex flex-col sm:flex-row gap-4 items-end sm:items-center">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground w-full sm:w-auto">
            <Filter className="w-4 h-4" /> Filter:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full sm:flex-1">
            <Input 
              type="date" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-background border-border/50"
            />
            <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
              <SelectTrigger className="bg-background border-border/50">
                <SelectValue placeholder="Pilih Pegawai" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Pegawai</SelectItem>
                {employees?.map(emp => (
                  <SelectItem key={emp.id} value={emp.id.toString()}>{emp.fullName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2">
              <RefreshCcw className="w-4 h-4" /> Reset
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Pegawai</TableHead>
                <TableHead>Departemen</TableHead>
                <TableHead>Jam Masuk</TableHead>
                <TableHead>Jam Pulang</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Foto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({length: 5}).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded-md mx-auto" /></TableCell>
                  </TableRow>
                ))
              ) : !attendance || attendance.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    Tidak ada data presensi ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                attendance.map((record) => (
                  <TableRow 
                    key={record.id} 
                    className="hover:bg-secondary/20 transition-colors cursor-pointer"
                    onClick={() => setSelectedRecord(record)}
                  >
                    <TableCell className="font-medium whitespace-nowrap">
                      {format(new Date(record.date), "dd MMM yyyy", { locale: idLocale })}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{record.employeeName}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {record.department}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {record.checkInAt ? format(new Date(record.checkInAt), "HH:mm") : "-"}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {record.checkOutAt ? format(new Date(record.checkOutAt), "HH:mm") : "-"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={record.status} />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        {record.checkInPhoto ? (
                          <div className="w-8 h-8 rounded border overflow-hidden">
                            <img src={photoUrl(record.checkInPhoto)} alt="Thumb" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded border bg-secondary flex items-center justify-center text-muted-foreground">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Sheet open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Detail Presensi</SheetTitle>
          </SheetHeader>
          
          {selectedRecord && (
            <div className="space-y-6">
              <div className="bg-secondary/30 p-4 rounded-xl border border-border/50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{selectedRecord.employeeName}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5" /> {selectedRecord.position} • {selectedRecord.department}
                    </p>
                  </div>
                  <StatusBadge status={selectedRecord.status} />
                </div>
                <div className="pt-3 border-t border-border/50 text-sm font-medium flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-primary" />
                  {format(new Date(selectedRecord.date), "EEEE, dd MMMM yyyy", { locale: idLocale })}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-foreground border-b pb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Absen Masuk
                </h4>
                {selectedRecord.checkInAt ? (
                  <div className="space-y-3">
                    <p className="text-2xl font-mono font-bold text-primary">
                      {format(new Date(selectedRecord.checkInAt), "HH:mm:ss")}
                    </p>
                    {selectedRecord.checkInPhoto && (
                      <div className="rounded-xl overflow-hidden border-2 border-border shadow-sm">
                        <img src={photoUrl(selectedRecord.checkInPhoto)} alt="Selfie Masuk" className="w-full object-cover" />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic text-sm">Tidak ada data absen masuk.</p>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-foreground border-b pb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Absen Pulang
                </h4>
                {selectedRecord.checkOutAt ? (
                  <div className="space-y-3">
                    <p className="text-2xl font-mono font-bold text-primary">
                      {format(new Date(selectedRecord.checkOutAt), "HH:mm:ss")}
                    </p>
                    {selectedRecord.checkOutPhoto && (
                      <div className="rounded-xl overflow-hidden border-2 border-border shadow-sm">
                        <img src={photoUrl(selectedRecord.checkOutPhoto)} alt="Selfie Pulang" className="w-full object-cover" />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic text-sm">Belum melakukan absen pulang.</p>
                )}
              </div>

              {selectedRecord.notes && (
                <div className="space-y-2 pt-2">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Catatan</h4>
                  <p className="bg-muted p-3 rounded-lg text-sm">{selectedRecord.notes}</p>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
