export interface BackendErrorResponse {
  status: number;
  error: string;
  message?: string;
  errors?: Record<string, string[]>; 
}
