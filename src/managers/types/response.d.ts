export interface PaginatedResponse {
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
}

export interface IResponse {
  success: boolean;
  status: number;
  message: string;
  timestamp: string;
  data?: Array<any> | object | null;
  details?: any | null;
  meta?: any | null;
  errors?: Array<any> | object | string | null;
  pagination?: PaginatedResponse | null;
}

export type ErrorResponse = Omit<IResponse, "data" | "meta" | "pagination">;

export type SuccessResponse = Omit<IResponse, "errors" | "details">;
