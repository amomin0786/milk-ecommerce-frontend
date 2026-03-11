import { Component, OnInit } from '@angular/core';
import { SellerService } from 'src/app/core/services/seller.service';

@Component({
  selector: 'app-seller-dashboard',
  templateUrl: './seller-dashboard.component.html'
})
export class SellerDashboardComponent implements OnInit {
  loading = false;
  err = '';

  data: any = {
    products: 0,
    orders: 0,
    revenue: 0,
    lowStock: [],
    recentOrders: []
  };

  chartBars: Array<{
    label: string;
    amount: number;
    height: number;
  }> = [];

  constructor(private sellerApi: SellerService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.err = '';

    this.sellerApi.getDashboard().subscribe({
      next: (res: any) => {
        this.data = {
          products: res?.products ?? 0,
          orders: res?.orders ?? 0,
          revenue: res?.revenue ?? 0,
          lowStock: Array.isArray(res?.lowStock) ? res.lowStock : [],
          recentOrders: Array.isArray(res?.recentOrders) ? res.recentOrders : []
        };

        this.buildChartBars();
        this.loading = false;
      },
      error: (err: any) => {
        this.err = err?.error?.message || err?.error || 'Failed to load seller dashboard';
        this.loading = false;
      }
    });
  }

  buildChartBars(): void {
    const orders = Array.isArray(this.data?.recentOrders) ? [...this.data.recentOrders] : [];

    const lastOrders = orders
      .sort((a: any, b: any) => {
        const da = new Date(a?.orderDate || 0).getTime();
        const db = new Date(b?.orderDate || 0).getTime();
        return da - db;
      })
      .slice(-7);

    const maxAmount = Math.max(
      ...lastOrders.map((o: any) => Number(o?.totalAmount ?? 0)),
      1
    );

    this.chartBars = lastOrders.map((o: any, index: number) => {
      const amount = Number(o?.totalAmount ?? 0);
      const rawDate = o?.orderDate ? new Date(o.orderDate) : null;
      const label = rawDate && !isNaN(rawDate.getTime())
        ? rawDate.toLocaleDateString(undefined, { day: '2-digit', month: 'short' })
        : `Order ${index + 1}`;

      const height = Math.max(12, Math.round((amount / maxAmount) * 160));

      return {
        label,
        amount,
        height
      };
    });
  }

  money(v: any): string {
    const n = Number(v ?? 0);
    return isNaN(n) ? '0.00' : n.toFixed(2);
  }

  formatDate(value?: any): string {
    if (!value) return '-';
    const d = new Date(value);
    return isNaN(d.getTime()) ? String(value) : d.toLocaleString();
  }

  stockClass(stock: any): string {
    const n = Number(stock ?? 0);
    if (n <= 0) return 'text-red-700';
    if (n <= 5) return 'text-yellow-700';
    return 'text-gray-900';
  }

  stockBadgeClass(stock: any): string {
    const n = Number(stock ?? 0);
    if (n <= 0) return 'bg-red-50 text-red-700 border-red-200';
    if (n <= 5) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return 'bg-green-50 text-green-700 border-green-200';
  }

  stockLabel(stock: any): string {
    const n = Number(stock ?? 0);
    if (n <= 0) return 'Out of Stock';
    if (n <= 5) return 'Low Stock';
    return 'In Stock';
  }

  outOfStockCount(): number {
    const list = Array.isArray(this.data?.lowStock) ? this.data.lowStock : [];
    return list.filter((p: any) => Number(p?.stock ?? 0) <= 0).length;
  }

  lowStockCount(): number {
    const list = Array.isArray(this.data?.lowStock) ? this.data.lowStock : [];
    return list.filter((p: any) => {
      const n = Number(p?.stock ?? 0);
      return n > 0 && n <= 5;
    }).length;
  }

  averageOrderValue(): string {
    const orders = Number(this.data?.orders ?? 0);
    const revenue = Number(this.data?.revenue ?? 0);

    if (!orders || orders <= 0) return '0.00';
    return this.money(revenue / orders);
  }

  recentRevenue(): string {
    const orders = Array.isArray(this.data?.recentOrders) ? this.data.recentOrders : [];
    const total = orders.reduce((sum: number, o: any) => {
      return sum + Number(o?.totalAmount ?? 0);
    }, 0);

    return this.money(total);
  }

  healthText(): string {
    const products = Number(this.data?.products ?? 0);
    const orders = Number(this.data?.orders ?? 0);
    const warningCount = Array.isArray(this.data?.lowStock) ? this.data.lowStock.length : 0;

    if (products <= 0) return 'Add Products';
    if (orders <= 0) return 'Waiting for Orders';
    if (warningCount > 0) return 'Stock Attention Needed';

    return 'Store Running Well';
  }
}