import {
  useMutation,
  useQuery,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { api, queryKeys, type AuthUser } from "./api";

// Loose opts: passes through any react-query options. We only consume `enabled`.
type QueryOpts = { enabled?: boolean } & Record<string, unknown>;

// ---- Query keys re-exports (mirip nama dari kode lama agar pages tidak banyak berubah) ----
export const getGetCurrentUserQueryKey = () => queryKeys.me();
export const getListEmployeesQueryKey = () => queryKeys.employees();
export const getGetEmployeeQueryKey = (id: number) => queryKeys.employee(id);
export const getListAttendanceQueryKey = (
  params: { date?: string; employeeId?: number } = {},
) => queryKeys.attendance(params);
export const getGetMyAttendanceTodayQueryKey = () =>
  queryKeys.attendanceToday();
export const getGetDashboardSummaryQueryKey = () =>
  queryKeys.dashboardSummary();
export const getGetRecentAttendanceQueryKey = () => queryKeys.dashboardRecent();

// ---- Auth ----
export function useGetCurrentUser(opts?: {
  query?: Partial<UseQueryOptions<AuthUser>>;
}) {
  return useQuery<AuthUser>({
    queryKey: getGetCurrentUserQueryKey(),
    queryFn: () => api.me(),
    retry: false,
    ...(opts?.query ?? {}),
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: (vars: { data: { username: string; password: string } }) =>
      api.login(vars.data),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: () => api.logout(),
  });
}

// ---- Employees ----
export function useListEmployees(opts?: { query?: QueryOpts }) {
  return useQuery({
    queryKey: getListEmployeesQueryKey(),
    queryFn: () => api.listEmployees(),
    enabled: opts?.query?.enabled ?? true,
  });
}

export function useGetEmployee(
  id: number,
  opts?: { query?: QueryOpts },
) {
  return useQuery({
    queryKey: getGetEmployeeQueryKey(id),
    queryFn: () => api.getEmployee(id),
    enabled: opts?.query?.enabled ?? !!id,
  });
}

export function useCreateEmployee() {
  return useMutation({
    mutationFn: (vars: { data: Parameters<typeof api.createEmployee>[0] }) =>
      api.createEmployee(vars.data),
  });
}

export function useUpdateEmployee() {
  return useMutation({
    mutationFn: (vars: {
      id: number;
      data: Parameters<typeof api.updateEmployee>[1];
    }) => api.updateEmployee(vars.id, vars.data),
  });
}

export function useDeleteEmployee() {
  return useMutation({
    mutationFn: (vars: { id: number }) => api.deleteEmployee(vars.id),
  });
}

// ---- Attendance ----
export function useListAttendance(
  params: { date?: string; employeeId?: number } = {},
  opts?: { query?: QueryOpts },
) {
  return useQuery({
    queryKey: getListAttendanceQueryKey(params),
    queryFn: () => api.listAttendance(params),
    enabled: opts?.query?.enabled ?? true,
  });
}

export function useGetMyAttendanceToday(opts?: { query?: QueryOpts }) {
  return useQuery({
    queryKey: getGetMyAttendanceTodayQueryKey(),
    queryFn: () => api.getMyAttendanceToday(),
    enabled: opts?.query?.enabled ?? true,
  });
}

export function useCheckIn() {
  return useMutation({
    mutationFn: (vars: { data: { photo: string; notes?: string | null } }) =>
      api.checkIn(vars.data),
  });
}

export function useCheckOut() {
  return useMutation({
    mutationFn: (vars: { data: { photo: string; notes?: string | null } }) =>
      api.checkOut(vars.data),
  });
}

// ---- Dashboard ----
export function useGetDashboardSummary(opts?: { query?: QueryOpts }) {
  return useQuery({
    queryKey: getGetDashboardSummaryQueryKey(),
    queryFn: () => api.getDashboardSummary(),
    enabled: opts?.query?.enabled ?? true,
  });
}

export function useGetRecentAttendance(opts?: { query?: QueryOpts }) {
  return useQuery({
    queryKey: getGetRecentAttendanceQueryKey(),
    queryFn: () => api.getRecentAttendance(),
    enabled: opts?.query?.enabled ?? true,
  });
}

export type { AuthUser } from "./api";
