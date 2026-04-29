const BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

export interface AuthUser {
  id: number;
  username: string;
  role: "admin" | "employee";
  fullName: string;
  employeeId: number;
  position: string | null;
  department: string | null;
  photoUrl: string | null;
}

export interface Employee {
  id: number;
  fullName: string;
  username: string;
  role: "admin" | "employee";
  position: string;
  department: string;
  email: string | null;
  phone: string | null;
  photoUrl: string | null;
  createdAt: string;
}

export interface AttendanceRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  position: string;
  department: string;
  date: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  checkInPhoto: string | null;
  checkOutPhoto: string | null;
  status: "hadir" | "terlambat" | "izin";
  notes: string | null;
  createdAt: string;
}

export interface DashboardSummary {
  totalEmployees: number;
  presentToday: number;
  lateToday: number;
  absentToday: number;
  onLeaveToday: number;
  totalThisWeek: number;
}

export interface TodayAttendance {
  hasRecord: boolean;
  record: AttendanceRecord | null;
}

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || res.statusText;
    throw new ApiError(res.status, msg);
  }
  return data as T;
}

export const api = {
  // ---- Auth ----
  login: (body: { username: string; password: string }) =>
    request<AuthUser>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  logout: () => request<void>("/auth/logout", { method: "POST" }),
  me: () => request<AuthUser>("/auth/me"),

  // ---- Employees ----
  listEmployees: () => request<Employee[]>("/employees"),
  getEmployee: (id: number) => request<Employee>(`/employees/${id}`),
  createEmployee: (body: {
    fullName: string;
    username: string;
    password: string;
    role?: "admin" | "employee";
    position: string;
    department: string;
    email?: string | null;
    phone?: string | null;
  }) =>
    request<Employee>("/employees", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateEmployee: (
    id: number,
    body: Partial<{
      fullName: string;
      username: string;
      password: string;
      role: "admin" | "employee";
      position: string;
      department: string;
      email: string | null;
      phone: string | null;
    }>,
  ) =>
    request<Employee>(`/employees/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  deleteEmployee: (id: number) =>
    request<void>(`/employees/${id}`, { method: "DELETE" }),

  // ---- Attendance ----
  listAttendance: (params: { date?: string; employeeId?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.date) q.set("date", params.date);
    if (params.employeeId) q.set("employeeId", String(params.employeeId));
    const qs = q.toString();
    return request<AttendanceRecord[]>(
      `/attendance${qs ? `?${qs}` : ""}`,
    );
  },
  getMyAttendanceToday: () =>
    request<TodayAttendance>("/attendance/today"),
  checkIn: (body: { photo: string; notes?: string | null }) =>
    request<AttendanceRecord>("/attendance/check-in", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  checkOut: (body: { photo: string; notes?: string | null }) =>
    request<AttendanceRecord>("/attendance/check-out", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // ---- Dashboard ----
  getDashboardSummary: () =>
    request<DashboardSummary>("/dashboard/summary"),
  getRecentAttendance: () =>
    request<AttendanceRecord[]>("/dashboard/recent"),
};

// React Query keys
export const queryKeys = {
  me: () => ["auth", "me"] as const,
  employees: () => ["employees"] as const,
  employee: (id: number) => ["employees", id] as const,
  attendance: (params: { date?: string; employeeId?: number } = {}) =>
    ["attendance", params] as const,
  attendanceToday: () => ["attendance", "today"] as const,
  dashboardSummary: () => ["dashboard", "summary"] as const,
  dashboardRecent: () => ["dashboard", "recent"] as const,
};
