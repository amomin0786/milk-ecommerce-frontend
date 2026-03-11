import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../../../core/services/order.service';

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | string;

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.scss']
})
export class MyOrdersComponent implements OnInit {
  loading = false;
  error: string | null = null;

  orders: any[] = [];

  selectedOrder: any = null;
  selectedItems: any[] = [];
  detailsLoading = false;
  detailsError: string | null = null;

  cancelReason = '';
  cancelLoading = false;

  // ===== Tracking =====
  trackingOpen = false;
  trackingLoading = false;
  trackingError: string | null = null;
  selectedOrderId: number | null = null;
  timeline: any[] = [];

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = null;

    this.orderService.myOrders().subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : [];
        this.orders = list.sort((a: any, b: any) => (Number(b?.id ?? 0) - Number(a?.id ?? 0)));
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load orders.';
        this.loading = false;
      }
    });
  }

  openDetails(order: any): void {
    this.selectedOrder = order;
    this.selectedItems = [];
    this.detailsError = null;
    this.cancelReason = '';

    const id = this.orderId(order);
    if (!id) {
      this.detailsError = 'Invalid order id';
      return;
    }

    this.detailsLoading = true;
    this.orderService.items(id).subscribe({
      next: (items) => {
        this.selectedItems = Array.isArray(items) ? items : [];
        this.detailsLoading = false;
      },
      error: (err) => {
        this.detailsError = err?.error?.message || 'Failed to load order items.';
        this.detailsLoading = false;
      }
    });
  }

  closeDetails(): void {
    this.selectedOrder = null;
    this.selectedItems = [];
    this.detailsError = null;
    this.cancelReason = '';
    this.cancelLoading = false;
  }

  cancelSelectedOrder(): void {
    if (!this.selectedOrder) return;

    const id = this.orderId(this.selectedOrder);
    if (!id) return;

    if (!this.canCancel(this.selectedOrder)) return;

    this.cancelLoading = true;
    this.detailsError = null;

    this.orderService.cancel(id, this.cancelReason).subscribe({
      next: (updated: any) => {
        this.orders = this.orders.map((o: any) => (this.orderId(o) === this.orderId(updated) ? updated : o));
        this.selectedOrder = updated;
        this.cancelLoading = false;
        alert(`Order #${id} cancelled successfully`);
      },
      error: (err) => {
        this.detailsError = err?.error?.message || 'Cancel failed.';
        this.cancelLoading = false;
      }
    });
  }

  // ===== Tracking Methods =====

  trackOrder(orderId: number): void {
    if (!orderId) {
      this.trackingError = 'Invalid order id';
      return;
    }

    this.selectedOrderId = orderId;
    this.trackingOpen = true;
    this.trackingLoading = true;
    this.trackingError = null;
    this.timeline = [];

    this.orderService.getTimeline(orderId).subscribe({
      next: (res) => {
        this.timeline = Array.isArray(res) ? res : [];
        this.trackingLoading = false;
      },
      error: (err) => {
        console.error('Timeline error:', err);
        this.trackingError = err?.error?.message || err?.error || 'Failed to load timeline';
        this.trackingLoading = false;
      }
    });
  }

  closeTracking(): void {
    this.trackingOpen = false;
    this.trackingLoading = false;
    this.trackingError = null;
    this.selectedOrderId = null;
    this.timeline = [];
  }

  // =========================
  // Template-safe helpers
  // =========================

  orderId(o: any): number {
    return Number(o?.id ?? 0);
  }

  orderStatus(o: any): OrderStatus {
    return String(o?.orderStatus ?? '');
  }

  paymentMethod(o: any): string {
    return String(o?.paymentMethod ?? 'COD');
  }

  totalAmount(o: any): number {
    return Number(o?.totalAmount ?? 0);
  }

  orderDate(o: any): any {
    return o?.orderDate ?? o?.createdAt ?? null;
  }

  cancelledDate(o: any): any {
    return o?.cancelledDate ?? null;
  }

  cancelReasonText(o: any): string {
    return String(o?.cancelReason ?? '');
  }

  canCancel(o: any): boolean {
    const s = this.orderStatus(o);
    return s === 'PENDING' || s === 'CONFIRMED';
  }

  badgeClass(status: OrderStatus): string {
    switch ((status || '').toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'CONFIRMED':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'SHIPPED':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'DELIVERED':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'CANCELLED':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  }

  getStatusClass(status: string): string {
    const s = (status || '').toUpperCase();

    if (s === 'DELIVERED') return 'bg-green-100 text-green-700';
    if (s === 'SHIPPED') return 'bg-blue-100 text-blue-700';
    if (s === 'CONFIRMED') return 'bg-yellow-100 text-yellow-700';
    if (s === 'CANCELLED') return 'bg-red-100 text-red-700';

    return 'bg-gray-100 text-gray-700';
  }

  formatDate(value?: any): string {
    if (!value) return '-';
    const d = new Date(value);
    return isNaN(d.getTime()) ? String(value) : d.toLocaleString();
  }

  money(v: any): string {
    const n = Number(v ?? 0);
    return isNaN(n) ? '0.00' : n.toFixed(2);
  }

  downloadInvoice(id: number): void {
    this.orderService.downloadInvoice(id).subscribe({
      next: (data: Blob) => {
        const url = window.URL.createObjectURL(data);
        const a = document.createElement('a');

        a.href = url;
        a.download = `invoice_${id}.pdf`;

        a.click();

        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Invoice download failed', err);
      }
    });
  }
}