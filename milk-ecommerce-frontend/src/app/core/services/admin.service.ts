import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {

  private readonly baseUrl = `${environment.apiBaseUrl}/api/admin`;

  constructor(private http: HttpClient) {}

  getDashboardStats() {
    return this.http.get(`${this.baseUrl}/dashboard`);
  }

  getAllProducts() {
    return this.http.get<any[]>(`${environment.apiBaseUrl}/api/admin/products`);
  }

  updateProductStatus(productId: number, status: string) {
    const params = new HttpParams().set('status', status);

    return this.http.put(
      `${environment.apiBaseUrl}/api/admin/products/${productId}/status`,
      null,
      { params, responseType: 'text' }
    );
  }

  getAllUsers() {
    return this.http.get<any[]>(`${this.baseUrl}/all-users`);
  }

  getAllSellers() {
    return this.http.get<any[]>(`${environment.apiBaseUrl}/api/sellers/all`);
  }

  blockUser(id: number) {
    return this.http.put(`${this.baseUrl}/block/${id}`, null, { responseType: 'text' });
  }

  unblockUser(id: number) {
    return this.http.put(`${this.baseUrl}/unblock/${id}`, null, { responseType: 'text' });
  }

  getReports(from: string, to: string) {
    return this.http.get<any>(`${this.baseUrl}/reports?from=${from}&to=${to}`);
  }

  exportReports(from: string, to: string) {
    return this.http.get(
      `${this.baseUrl}/reports/export?from=${from}&to=${to}`,
      { responseType: 'blob' }
    );
  }
}