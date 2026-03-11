import { Component, OnInit } from '@angular/core';
import { OrderService } from 'src/app/core/services/order.service';

@Component({
  selector: 'app-seller-reports',
  templateUrl: './seller-reports.component.html'
})
export class SellerReportsComponent implements OnInit {
  loading = false;
  exporting = false;
  err = '';

  form = {
    from: '',
    to: ''
  };

  report: any = {
    revenue: 0,
    deliveredCount: 0,
    pendingCount: 0,
    shippedCount: 0,
    cancelledCount: 0,
    orders: []
  };

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    this.form.from = this.toInputDate(firstDay);
    this.form.to = this.toInputDate(today);

    this.load();
  }

  toInputDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  isInvalidRange(): boolean {
    return !this.form.from || !this.form.to || this.form.from > this.form.to;
  }

  load(): void {
    this.loading = true;
    this.err = '';

    if (!this.form.from || !this.form.to) {
      this.err = 'From and To dates are required';
      this.loading = false;
      return;
    }

    if (this.form.from > this.form.to) {
      this.err = 'From date cannot be greater than To date';
      this.loading = false;
      return;
    }

    this.orderService.sellerReports(this.form.from, this.form.to).subscribe({
      next: (res: any) => {
        this.report = {
          revenue: res?.revenue ?? 0,
          deliveredCount: res?.deliveredCount ?? 0,
          pendingCount: res?.pendingCount ?? 0,
          shippedCount: res?.shippedCount ?? 0,
          cancelledCount: res?.cancelledCount ?? 0,
          orders: Array.isArray(res?.orders) ? res.orders : []
        };
        this.loading = false;
      },
      error: (e: any) => {
        this.err = e?.error?.message || e?.error || 'Failed to load seller report';
        this.loading = false;
      }
    });
  }

  money(v: any): string {
    const n = Number(v ?? 0);
    return isNaN(n) ? '0.00' : n.toFixed(2);
  }

  formatDate(value: any): string {
    if (!value) return '-';
    const d = new Date(value);
    return isNaN(d.getTime()) ? String(value) : d.toLocaleString();
  }

  cardClass(type: string): string {
    const t = (type || '').toLowerCase();

    if (t === 'revenue') return 'border-black bg-black text-white';
    if (t === 'delivered') return 'border-green-200 bg-green-50';
    if (t === 'pending') return 'border-yellow-200 bg-yellow-50';
    if (t === 'shipped') return 'border-blue-200 bg-blue-50';
    if (t === 'cancelled') return 'border-red-200 bg-red-50';

    return 'border-gray-200 bg-white';
  }

  downloadCsv(): void {
    this.err = '';

    if (!this.form.from || !this.form.to) {
      this.err = 'From and To dates are required';
      return;
    }

    if (this.form.from > this.form.to) {
      this.err = 'From date cannot be greater than To date';
      return;
    }

    this.exporting = true;

    this.orderService.exportSellerReports(this.form.from, this.form.to).subscribe({
      next: (data: Blob) => {
        const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = `seller_report_${this.form.from}_to_${this.form.to}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        window.URL.revokeObjectURL(url);
        this.exporting = false;
      },
      error: (e: any) => {
        this.err = e?.error?.message || e?.error || 'Failed to export seller report';
        this.exporting = false;
      }
    });
  }
}