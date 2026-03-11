import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface SellerDashboardResponse {
  sellerId: number;
  shopName: string;
  approvalStatus: string;
  products: number;
  orders: number;
  revenue: number;
  lowStock?: any[];
  recentOrders?: any[];
}

@Injectable({ providedIn: 'root' })
export class SellerService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/sellers`;

  constructor(private http: HttpClient) {}

  applySeller(body: { shopName: string; gstNumber?: string | null }): Observable<any> {
    return this.http.post(`${this.baseUrl}/apply`, body);
  }

  pendingSellers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/pending`);
  }

  approveSeller(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/approve`, {});
  }

  rejectSeller(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/reject`, {});
  }

  getDashboard(): Observable<SellerDashboardResponse> {
    return this.http.get<SellerDashboardResponse>(`${this.baseUrl}/dashboard`);
  }

  getMySettings(): Observable<any> {
    return this.http.get(`${this.baseUrl}/me`);
  }

  updateMySettings(body: {
    name: string;
    phone: string;
    address: string;
    shopName: string;
    gstNumber?: string | null;
  }): Observable<any> {
    return this.http.put(`${this.baseUrl}/me`, body);
  }
}