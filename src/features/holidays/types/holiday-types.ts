export interface CreateHolidayRequest {
  name: string;
  description?: string | null;
  date: string; // YYYY-MM-DD
}

export interface UpdateHolidayRequest {
  name?: string;
  description?: string | null;
  date?: string; // YYYY-MM-DD
}

export interface AdminHolidayResponse {
  id: string;
  name: string;
  description: string | null;
  date: string; // YYYY-MM-DD
  active: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface EmployeeHolidayResponse {
  id: string;
  name: string;
  description: string | null;
  date: string; // YYYY-MM-DD
}

export interface HolidayPageResponse {
  content: AdminHolidayResponse[];
  page: number;
  limit: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface HolidaySearchParams {
  year?: number;
  fromDate?: string; // YYYY-MM-DD
  toDate?: string; // YYYY-MM-DD
  active?: boolean;
  page?: number;
  limit?: number;
  sortDirection?: "asc" | "desc";
}

export interface EmployeeHolidayParams {
  year?: number;
  fromDate?: string; // YYYY-MM-DD
  toDate?: string; // YYYY-MM-DD
}

