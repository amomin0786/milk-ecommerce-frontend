import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from 'src/app/core/services/order.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html'
})
export class OrdersComponent implements OnInit {
  loading = false;
  error = '';
  success = '';

  orders: any[] = [];

  trackingOpen = false;
  trackingLoading = false;
  trackingError = '';
  selectedOrderId: number | null = null;
  timeline: any[] = [];

  constructor(
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = '';
    this.success = '';

    this.orderService.getMyOrders().subscribe({
      next: (res) => {
        this.orders = res || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Load orders error:', err);
        this.error = err?.error?.message || err?.error || 'Failed to load orders';
        this.loading = false;
      }
    });
  }

  viewOrder(orderId: number): void {
    this.router.navigate(['/shop/orders', orderId]);
  }

  cancelOrder(orderId: number): void {
    const ok = confirm('Are you sure you want to cancel this order?');
    if (!ok) return;

    this.error = '';
    this.success = '';

    this.orderService.cancelOrder(orderId).subscribe({
      next: () => {
        alert(`Order #${orderId} cancelled successfully`);
        this.success = `Order #${orderId} cancelled successfully`;
        this.loadOrders();
      },
      error: (err) => {
        console.error('Cancel order error:', err);
        this.error = err?.error?.message || err?.error || 'Failed to cancel order';
      }
    });
  }

  trackOrder(orderId: number): void {
    this.selectedOrderId = orderId;
    this.trackingOpen = true;
    this.trackingLoading = true;
    this.trackingError = '';
    this.timeline = [];

    this.orderService.getTimeline(orderId).subscribe({
      next: (res) => {
        this.timeline = res || [];
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
    this.selectedOrderId = null;
    this.timeline = [];
    this.trackingError = '';
  }

  getStatusClass(status: string): string {
    const s = (status || '').toUpperCase();

    if (s === 'DELIVERED') return 'bg-green-100 text-green-700';
    if (s === 'SHIPPED') return 'bg-blue-100 text-blue-700';
    if (s === 'CONFIRMED') return 'bg-yellow-100 text-yellow-700';
    if (s === 'CANCELLED') return 'bg-red-100 text-red-700';

    return 'bg-gray-100 text-gray-700';
  }
}