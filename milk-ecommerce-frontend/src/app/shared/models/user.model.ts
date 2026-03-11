export type RoleName = 'ADMIN' | 'USER' | 'SELLER';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  status?: string;
  createdAt?: string;

  role?: {
    id: number;
    roleName: RoleName | string;
  };
}