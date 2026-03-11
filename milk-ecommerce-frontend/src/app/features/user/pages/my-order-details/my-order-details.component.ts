import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from 'src/app/core/services/order.service';

@Component({
  selector: 'app-my-order-details',
  templateUrl: './my-order-details.component.html'
})
export class MyOrderDetailsComponent implements OnInit {

  loading = false;
  err = '';

  orderId = 0;

  order: any = null;
  items: any[] = [];

  cancelReason = '';
  cancelLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orders: OrderService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id') || 0);
    this.orderId = id;

    if (!this.orderId) {
      this.err = 'Invalid order id';
      return;
    }

    this.load();
  }

  back(): void {
    this.router.navigateByUrl('/user/my-orders');
  }

  load(): void {
    this.loading = true;
    this.err = '';

    // ✅ Load order list and find this order
    this.orders.myOrders().subscribe({
      next: (orders: any[]) => {
        const list = orders || [];
        this.order = list.find(o => Number(o?.id ?? 0) === this.orderId) || null;

        // Load items
        this.orders.items(this.orderId).subscribe({
          next: (its: any[]) => {
            this.items = its || [];
            this.loading = false;
          },
          error: (e: any) => {
            this.loading = false;
            this.err = e?.error?.message || e?.error || 'Failed to load order items';
          }
        });
      },
      error: (e: any) => {
        this.loading = false;
        this.err = e?.error?.message || e?.error || 'Failed to load order';
      }
    });
  }

  status(): string {
    return String(this.order?.orderStatus ?? '');
  }

  paymentMethod(): string {
    return String(this.order?.paymentMethod ?? '');
  }

  totalAmount(): number {
    return Number(this.order?.totalAmount ?? 0);
  }

  canCancel(): boolean {
    const s = this.status();
    return s === 'PENDING' || s === 'CONFIRMED';
  }

  badgeClass(): string {
    switch (this.status()) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SHIPPED': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'DELIVERED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  cancel(): void {
    if (!this.canCancel()) return;

    this.cancelLoading = true;
    this.err = '';

    this.orders.cancel(this.orderId, this.cancelReason).subscribe({
      next: (updated: any) => {
        this.order = updated;
        this.cancelLoading = false;
        alert('Order cancelled ✅');
      },
      error: (e: any) => {
        this.cancelLoading = false;
        this.err = e?.error?.message || e?.error || 'Cancel failed';
      }
    });
  }
}