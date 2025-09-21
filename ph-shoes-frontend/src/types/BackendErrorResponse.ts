
export interface BackendErrorResponse {
  status: number;
  error: string;
  errors?: Record<string, string[]>; 
}