import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "@/lib/hooks";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Droplets, LogIn } from "lucide-react";
import loginHeroImage from "@/assets/images/login-hero.png";
import { toast } from "sonner";

const loginSchema = z.object({
  username: z.string().min(1, "Username tidak boleh kosong"),
  password: z.string().min(1, "Password tidak boleh kosong"),
});

export default function Login() {
  const [_, setLocation] = useLocation();
  const loginMutation = useLogin();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(
      { data: values },
      {
        onSuccess: () => {
          toast.success("Login berhasil", {
            description: "Selamat datang kembali di PresensiAqua",
          });
          window.location.href = "/"; // Force full reload to reset auth context state cleanly
        },
        onError: (error) => {
          toast.error("Gagal login", {
            description: (error as { status?: number }).status === 401 ? "Username atau password salah" : "Terjadi kesalahan server",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-[100dvh] w-full flex bg-background">
      {/* Left side - Visual Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary/10">
        <div className="absolute inset-0 z-0">
          <img 
            src={loginHeroImage} 
            alt="Aqua Spring Water" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent mix-blend-multiply" />
        </div>
        <div className="relative z-10 flex flex-col justify-end p-16 h-full text-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm border border-white/30">
              <Droplets className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">PresensiAqua</h1>
          </div>
          <h2 className="text-5xl font-semibold leading-tight mb-4 text-white drop-shadow-md">
            Sistem Kehadiran <br />Pegawai Modern.
          </h2>
          <p className="text-lg text-white/90 max-w-md font-medium drop-shadow">
            Catat kehadiran Anda dengan mudah, cepat, dan aman menggunakan pengenalan wajah biometrik.
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="absolute top-8 left-8 lg:hidden flex items-center gap-2 text-primary">
          <Droplets className="h-8 w-8" />
          <span className="font-bold text-xl">Presensi<span className="text-foreground">Aqua</span></span>
        </div>

        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="text-center lg:text-left space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Selamat Datang</h1>
            <p className="text-muted-foreground">Silakan masuk ke akun Anda untuk melanjutkan.</p>
          </div>

          <Card className="border-border/60 shadow-xl shadow-primary/5 rounded-2xl bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80">Username</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Masukkan username Anda" 
                            className="h-12 px-4 rounded-xl bg-background focus-visible:ring-primary/30" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80">Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            className="h-12 px-4 rounded-xl bg-background focus-visible:ring-primary/30" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-semibold rounded-xl shadow-md hover:shadow-lg transition-all" 
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Memproses..." : (
                      <>
                        <LogIn className="mr-2 h-5 w-5" />
                        Masuk
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="bg-secondary/50 rounded-xl p-5 border border-border/50 text-sm">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              Info Kredensial Demo
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background rounded-lg p-3 border border-border">
                <span className="text-muted-foreground block mb-1 text-xs uppercase tracking-wider font-semibold">Admin HR</span>
                <code className="text-primary font-bold">admin</code> / <code className="text-primary font-bold">admin123</code>
              </div>
              <div className="bg-background rounded-lg p-3 border border-border">
                <span className="text-muted-foreground block mb-1 text-xs uppercase tracking-wider font-semibold">Pegawai</span>
                <code className="text-primary font-bold">budi</code> / <code className="text-primary font-bold">budi123</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
