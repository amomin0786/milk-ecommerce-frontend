import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

export type PaymentMethod = 'COD' | 'RAZORPAY';

export interface PaymentInitiateRequest {
  orderId: number;
  method: PaymentMethod;
}

export interface PaymentInitiateResponse {
  paymentId: number;
  orderId: number;
  paymentStatus: string;
  paymentMethod: PaymentMethod;
  transactionId: string;
  amount: number;
  currency: string;
  provider: string;
  createdAt: string;
  keyId?: string;
  providerOrderId?: string;
}

export interface PaymentSummaryResponse {
  paymentId: number;
  orderId: number;
  paymentStatus: string;
  paymentMethod: PaymentMethod;
  transactionId: string;
  amount: number;
  currency: string;
  paymentDate: string | null;
}

export interface RazorpayVerifyRequest {
  paymentId: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface RazorpayVerifyResponse {
  verified: boolean;
  paymentId: number;
  orderId: number;
  paymentStatus: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly baseUrl = environment.apiBaseUrl + '/api/payments';

  constructor(private http: HttpClient) {}

  private url(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  initiate(req: PaymentInitiateRequest): Observable<PaymentInitiateResponse> {
    if (!req?.orderId || req.orderId <= 0) {
      return throwError(() => new Error('Invalid orderId'));
    }
    if (!req?.method) {
      return throwError(() => new Error('Payment method is required'));
    }
    return this.http.post<PaymentInitiateResponse>(this.url('/initiate'), req);
  }

  verifyRazorpay(req: RazorpayVerifyRequest): Observable<RazorpayVerifyResponse> {
    if (!req?.paymentId) {
      return throwError(() => new Error('Invalid paymentId'));
    }
    return this.http.post<RazorpayVerifyResponse>(this.url('/razorpay/verify'), req);
  }

  myPayments(): Observable<PaymentSummaryResponse[]> {
    return this.http.get<PaymentSummaryResponse[]>(this.url('/my'));
  }

  myPaymentByOrder(orderId: number): Observable<PaymentSummaryResponse> {
    if (!orderId || orderId <= 0) {
      return throwError(() => new Error('Invalid orderId'));
    }
    return this.http.get<PaymentSummaryResponse>(this.url(`/my/order/${orderId}`));
  }
}