export type EmploymentStatus = "ACTIVE" | "INACTIVE" | "TERMINATED";
export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERN";
export type Gender = "MALE" | "FEMALE" | "NON_BINARY" | "PREFER_NOT_TO_SAY";

export type EmployeeAddress = {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type EmergencyContact = {
  name: string;
  relationship: string;
  phone: string;
};

export type Employee = {
  id: string;
  employeeCode: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: Gender;
  profileImageUrl?: string;
  address?: EmployeeAddress;
  designation?: string;
  departmentId?: string;
  employmentType: EmploymentType;
  joiningDate: string;
  terminationDate?: string;
  employmentStatus: EmploymentStatus;
  reportingManagerId?: string;
  workLocation?: string;
  emergencyContact?: EmergencyContact;
  createdAt?: string;
  updatedAt?: string;
};

export type EmployeePage = {
  content: Employee[];
  page: number;
  limit: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

export type EmployeeListParams = {
  page: number;
  limit: number;
  search?: string;
  employmentStatus?: EmploymentStatus;
  employmentType?: EmploymentType;
  departmentId?: string;
  designation?: string;
  sortBy?:
    | "employeeCode"
    | "firstName"
    | "lastName"
    | "email"
    | "joiningDate"
    | "employmentStatus"
    | "designation"
    | "createdAt";
  sortDirection?: "asc" | "desc";
};

export type CreateEmployeeRequest = {
  firstName: string;
  lastName: string;
  email: string;
  employmentType: EmploymentType;
  joiningDate: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: Gender;
  profileImageUrl?: string;
  address?: EmployeeAddress;
  designation?: string;
  departmentId?: string;
  reportingManagerId?: string;
  workLocation?: string;
  emergencyContact?: EmergencyContact;
};

export type UpdateEmployeeRequest = Partial<
  Omit<CreateEmployeeRequest, "joiningDate">
> & {
  terminationDate?: string;
};
