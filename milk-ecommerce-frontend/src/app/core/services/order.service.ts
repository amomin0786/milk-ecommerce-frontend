import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Order } from 'src/app/shared/models/order.model';
import { OrderItem } from 'src/app/shared/models/order-item.model';

export interface PlaceOrderPayload {
  paymentMethod: string;
  customerName?: string;
  customerPhone?: string;
  shippingAddress?: string;
}

export interface SellerOrderUser {
  id: number;
  name: string;
  email: string;
}

export interface SellerOrderItem {
  id: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface SellerOrder {
  id: number;
  orderDate: string;
  totalAmount: number;
  orderStatus: string;
  paymentMethod: string;
  refundStatus: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: string;
  user: SellerOrderUser | null;
  items: SellerOrderItem[];
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private readonly baseUrl = `${environment.apiBaseUrl}/api/orders`;
  private readonly sellerBaseUrl = `${environment.apiBaseUrl}/api/sellers`;

  constructor(private http: HttpClient) {}

  placeOrder(payload: string | PlaceOrderPayload): Observable<any> {
    const body = typeof payload === 'string'
      ? { paymentMethod: payload }
      : payload;

    return this.http.post(`${this.baseUrl}/place`, body);
  }

  myOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/my`);
  }

  getMyOrders(): Observable<Order[]> {
    return this.myOrders();
  }

  items(orderId: number): Observable<OrderItem[]> {
    return this.http.get<OrderItem[]>(`${this.baseUrl}/${orderId}/items`);
  }

  cancel(orderId: number, reason: string = ''): Observable<Order> {
    let params = new HttpParams();

    if (reason && reason.trim()) {
      params = params.set('reason', reason.trim());
    }

    return this.http.put<Order>(
      `${this.baseUrl}/${orderId}/cancel`,
      null,
      { params }
    );
  }

  cancelOrder(orderId: number, reason?: string): Observable<Order> {
    return this.cancel(orderId, reason ?? '');
  }

  sellerOrders(): Observable<SellerOrder[]> {
    return this.http.get<SellerOrder[]>(`${this.baseUrl}/seller/items`);
  }

  sellerReports(from: string, to: string): Observable<any> {
    return this.http.get<any>(`${this.sellerBaseUrl}/reports?from=${from}&to=${to}`);
  }

  exportSellerReports(from: string, to: string) {
    return this.http.get(
      `${this.sellerBaseUrl}/reports/export?from=${from}&to=${to}`,
      { responseType: 'blob' }
    );
  }

  allAdminOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/all`);
  }

  exportAdminOrders(from: string, to: string) {
    return this.http.get(
      `${this.baseUrl}/admin/export?from=${from}&to=${to}`,
      { responseType: 'blob' }
    );
  }

  updateStatus(orderId: number, status: string): Observable<any> {
    const params = new HttpParams().set('status', status);

    return this.http.put(
      `${this.baseUrl}/${orderId}/status`,
      null,
      { params }
    );
  }

  getTimeline(orderId: number) {
    return this.http.get<any[]>(`${this.baseUrl}/${orderId}/timeline`);
  }

  downloadInvoice(orderId: number) {
    return this.http.get(
      `${environment.apiBaseUrl}/api/orders/${orderId}/invoice`,
      { responseType: 'blob' }
    );
  }

  all(): Observable<any[]> {
    return this.allAdminOrders();
  }
}