export type DepartmentStatus = "ACTIVE" | "INACTIVE";

export type Department = {
  id: string;
  departmentCode: string;
  name: string;
  description?: string;
  managerEmployeeId?: string;
  status: DepartmentStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type DepartmentPage = {
  content: Department[];
  page: number;
  limit: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

export type DepartmentSortField = "departmentCode" | "name" | "status" | "createdAt";

export type DepartmentListParams = {
  page: number;
  limit: number;
  search?: string;
  status?: DepartmentStatus;
  sortBy?: DepartmentSortField;
  sortDirection?: "asc" | "desc";
};

export type CreateDepartmentRequest = {
  departmentCode: string;
  name: string;
  description?: string;
  managerEmployeeId?: string;
};

export type UpdateDepartmentRequest = Partial<CreateDepartmentRequest>;
