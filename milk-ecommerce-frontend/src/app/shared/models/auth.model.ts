export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string; // if backend returns {token:"..."}
}