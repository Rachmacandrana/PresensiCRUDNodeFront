import React, { useState } from "react";
import { 
  useListEmployees, getListEmployeesQueryKey,
  useCreateEmployee, useUpdateEmployee, useDeleteEmployee 
} from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit2, Trash2, ShieldAlert, User as UserIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const employeeSchema = z.object({
  fullName: z.string().min(1, "Nama tidak boleh kosong"),
  username: z.string().min(3, "Username minimal 3 karakter"),
  password: z.string().optional(),
  role: z.enum(["admin", "employee"]),
  position: z.string().min(1, "Posisi tidak boleh kosong"),
  department: z.string().min(1, "Departemen tidak boleh kosong"),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
});

export default function Employees() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: employees, isLoading } = useListEmployees();
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const deleteMutation = useDeleteEmployee();

  const form = useForm<z.infer<typeof employeeSchema>>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      fullName: "", username: "", password: "", role: "employee", position: "", department: "", email: "", phone: ""
    }
  });

  const filteredEmployees = employees?.filter(emp => 
    emp.fullName.toLowerCase().includes(search.toLowerCase()) ||
    emp.username.toLowerCase().includes(search.toLowerCase()) ||
    emp.position.toLowerCase().includes(search.toLowerCase()) ||
    emp.department.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleOpenAdd = () => {
    form.reset({ fullName: "", username: "", password: "", role: "employee", position: "", department: "", email: "", phone: "" });
    setEditingId(null);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (emp: any) => {
    form.reset({
      fullName: emp.fullName,
      username: emp.username,
      password: "", // leave blank to keep existing
      role: emp.role,
      position: emp.position,
      department: emp.department,
      email: emp.email || "",
      phone: emp.phone || ""
    });
    setEditingId(emp.id);
    setIsAddOpen(true);
  };

  const onSubmit = (values: z.infer<typeof employeeSchema>) => {
    if (editingId) {
      const dataToSubmit = { ...values };
      if (!dataToSubmit.password) delete dataToSubmit.password;
      
      updateMutation.mutate({ id: editingId, data: dataToSubmit as any }, {
        onSuccess: () => {
          toast.success("Pegawai berhasil diperbarui");
          queryClient.invalidateQueries({ queryKey: getListEmployeesQueryKey() });
          setIsAddOpen(false);
        },
        onError: (err: any) => toast.error(err?.error || "Gagal memperbarui pegawai")
      });
    } else {
      if (!values.password) {
        form.setError("password", { message: "Password wajib untuk pegawai baru" });
        return;
      }
      createMutation.mutate({ data: values as any }, {
        onSuccess: () => {
          toast.success("Pegawai berhasil ditambahkan");
          queryClient.invalidateQueries({ queryKey: getListEmployeesQueryKey() });
          setIsAddOpen(false);
        },
        onError: (err: any) => toast.error(err?.error || "Gagal menambahkan pegawai")
      });
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate({ id: deleteId }, {
      onSuccess: () => {
        toast.success("Pegawai dihapus");
        queryClient.invalidateQueries({ queryKey: getListEmployeesQueryKey() });
        setDeleteId(null);
      },
      onError: (err: any) => toast.error(err?.error || "Gagal menghapus pegawai")
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Manajemen Pegawai</h1>
          <p className="text-muted-foreground mt-1">Kelola data pegawai, posisi, dan hak akses sistem.</p>
        </div>
        <Button onClick={handleOpenAdd} className="rounded-xl shadow-md">
          <Plus className="w-4 h-4 mr-2" /> Tambah Pegawai
        </Button>
      </div>

      <Card className="border-border/60 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-secondary/20">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Cari nama, posisi, atau departemen..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 rounded-lg bg-background border-border/50 focus-visible:ring-primary/30"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-16"></TableHead>
                <TableHead>Pegawai</TableHead>
                <TableHead>Posisi & Departemen</TableHead>
                <TableHead>Hak Akses</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({length: 5}).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="w-10 h-10 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32 mb-2" /><Skeleton className="h-3 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-3 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    Tidak ada data pegawai ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((emp) => (
                  <TableRow key={emp.id} className="hover:bg-secondary/20 transition-colors">
                    <TableCell>
                      <Avatar className="h-10 w-10 border border-primary/10">
                        <AvatarImage src={emp.photoUrl || ""} />
                        <AvatarFallback className="bg-primary/5 text-primary font-semibold">
                          {emp.fullName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-foreground">{emp.fullName}</p>
                      <p className="text-xs text-muted-foreground">@{emp.username}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{emp.position}</p>
                      <p className="text-xs text-muted-foreground">{emp.department}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={emp.role === 'admin' ? 'default' : 'secondary'} className="capitalize shadow-sm">
                        {emp.role === 'admin' ? <ShieldAlert className="w-3 h-3 mr-1" /> : <UserIcon className="w-3 h-3 mr-1" />}
                        {emp.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(emp)} className="h-8 w-8 text-muted-foreground hover:text-primary">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(emp.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Pegawai" : "Tambah Pegawai Baru"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="fullName" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Nama Lengkap</FormLabel>
                    <FormControl><Input placeholder="Budi Santoso" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="username" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl><Input placeholder="budi" {...field} disabled={!!editingId} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password {editingId && "(opsional)"}</FormLabel>
                    <FormControl><Input type="password" placeholder="••••••" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="position" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Posisi</FormLabel>
                    <FormControl><Input placeholder="Operator" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="department" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departemen</FormLabel>
                    <FormControl><Input placeholder="Produksi" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="role" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Hak Akses</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih hak akses" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="employee">Pegawai</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Batal</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pegawai?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Semua data presensi terkait pegawai ini mungkin akan terpengaruh.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
