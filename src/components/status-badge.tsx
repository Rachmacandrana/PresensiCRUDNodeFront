import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, FileText } from "lucide-react";

interface StatusBadgeProps {
  status: "hadir" | "terlambat" | "izin" | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status?.toLowerCase()) {
    case "hadir":
      return (
        <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-1.5 px-2.5 py-0.5 font-medium shadow-sm">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Hadir
        </Badge>
      );
    case "terlambat":
      return (
        <Badge variant="default" className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1.5 px-2.5 py-0.5 font-medium shadow-sm">
          <Clock className="w-3.5 h-3.5" />
          Terlambat
        </Badge>
      );
    case "izin":
      return (
        <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1.5 px-2.5 py-0.5 font-medium shadow-sm">
          <FileText className="w-3.5 h-3.5" />
          Izin
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="flex items-center gap-1.5 px-2.5 py-0.5 font-medium capitalize shadow-sm">
          {status}
        </Badge>
      );
  }
}
