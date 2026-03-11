import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {
  loading = false;
  err = '';

  stats: any = {
    users: 0,
    sellers: 0,
    products: 0,
    orders: 0,
    revenue: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    pendingSellers: 0,
    lowStockProducts: 0
  };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.err = '';

    this.adminService.getDashboardStats().subscribe({
      next: (res: any) => {
        this.stats = {
          ...this.stats,
          ...(res || {})
        };
        this.loading = false;
      },
      error: (e: any) => {
        this.err = e?.error?.message || e?.error || 'Failed to load dashboard';
        this.loading = false;
      }
    });
  }

  money(v: any): string {
    const n = Number(v ?? 0);
    return isNaN(n) ? '0.00' : n.toFixed(2);
  }

  cardTone(type: string): string {
    const t = (type || '').toLowerCase();

    if (t === 'revenue') return 'border-black bg-black text-white';
    if (t === 'warning') return 'border-yellow-200 bg-yellow-50';
    if (t === 'danger') return 'border-red-200 bg-red-50';
    if (t === 'success') return 'border-green-200 bg-green-50';

    return 'border-gray-200 bg-white';
  }

  marketplaceHealth(): string {
    const products = Number(this.stats?.products ?? 0);
    const orders = Number(this.stats?.orders ?? 0);
    const cancelled = Number(this.stats?.cancelledOrders ?? 0);

    if (products <= 0) return 'Need Products';
    if (orders <= 0) return 'Slow Activity';
    if (cancelled > orders / 2 && orders > 0) return 'Needs Attention';

    return 'Running Well';
  }
}