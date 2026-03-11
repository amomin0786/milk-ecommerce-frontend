import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { OrderService } from 'src/app/core/services/order.service';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html'
})
export class OrderDetailsComponent implements OnInit {

  environment = environment;

  loading = false;
  err = '';

  orderId!: number;

  // ✅ add
  order: any = null;
  items: any[] = [];

  cancelReason = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private orders: OrderService
  ) {}

  ngOnInit(): void {
    this.orderId = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  // ✅ loads order + items
  load() {
    this.loading = true;
    this.err = '';

    // 1) load order (from /my) so we can show status + allow cancel
    this.orders.myOrders().subscribe({
      next: (list: any[]) => {
        this.order = (list || []).find(o => Number(o.id) === this.orderId) || null;

        // 2) load items
        this.loadItems();
      },
      error: (e: HttpErrorResponse) => {
        this.loading = false;
        this.err = typeof e?.error === 'string' ? e.error : 'Failed to load order';
      }
    });
  }

  // ✅ only items
  loadItems() {
    this.http.get<any[]>(
      `${environment.apiBaseUrl}/api/orders/${this.orderId}/items`
    ).subscribe({
      next: (data: any[]) => {
        this.items = data || [];
        this.loading = false;
      },
      error: (e: HttpErrorResponse) => {
        this.loading = false;
        this.err = typeof e?.error === 'string' ? e.error : 'Failed to load order items';
      }
    });
  }

  get total(): number {
    return (this.items || []).reduce((sum, it) => {
      const price = Number(it?.price || 0);
      const qty = Number(it?.quantity || 1);
      return sum + price * qty;
    }, 0);
  }

  cancelOrder() {
    if (!confirm('Cancel this order?')) return;

    this.orders.cancel(this.orderId, this.cancelReason).subscribe({
      next: (o: any) => {
        alert('Order cancelled ✅');
        this.order = o;
        this.loadItems();
      },
      error: (e: HttpErrorResponse) => {
        alert(typeof e?.error === 'string' ? e.error : 'Cancel failed');
      }
    });
  }
}