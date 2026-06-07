export type UserRole = 'ROLE_USER' | 'ROLE_AGENT' | 'ROLE_ADMIN';

export interface User {
  id?: number;
  username: string;
  email?: string;
  role: UserRole;
  active?: boolean;
}

export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  username: string;
  role: UserRole;
}
