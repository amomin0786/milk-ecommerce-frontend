import { Component, OnInit } from '@angular/core';
import { OrderService } from 'src/app/core/services/order.service';

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | string;

@Component({
  selector: 'app-admin-orders',
  templateUrl: './admin-orders.component.html'
})
export class AdminOrdersComponent implements OnInit {
  loading = false;
  saving = false;
  exporting = false;

  err = '';
  success = '';

  orders: any[] = [];
  filtered: any[] = [];

  q = '';
  statusFilter = 'ALL';

  fromDate = '';
  toDate = '';

  selected: any = null;
  selectedItems: any[] = [];
  itemsLoading = false;
  itemsError = '';

  newStatus: OrderStatus = 'CONFIRMED';

  constructor(private ordersApi: OrderService) {}

  ngOnInit(): void {
    this.setDefaultDates();
    this.load();
  }

  setDefaultDates(): void {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    this.fromDate = this.toInputDate(firstDay);
    this.toDate = this.toInputDate(today);
  }

  toInputDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  load(): void {
    this.loading = true;
    this.err = '';
    this.success = '';

    this.ordersApi.allAdminOrders().subscribe({
      next: (res: any[]) => {
        this.orders = Array.isArray(res) ? res : [];
        this.orders.sort((a, b) => Number(b?.id ?? 0) - Number(a?.id ?? 0));
        this.applyFilters();
        this.loading = false;
      },
      error: (e: any) => {
        this.loading = false;
        this.err = e?.error?.message || e?.error || 'Failed to load admin orders';
      }
    });
  }

  applyFilters(): void {
    const search = (this.q || '').trim().toLowerCase();

    this.filtered = this.orders.filter((o: any) => {
      const orderId = String(o?.id ?? '').toLowerCase();
      const email = String(o?.user?.email ?? '').toLowerCase();
      const name = String(o?.user?.name ?? '').toLowerCase();
      const payment = String(o?.paymentMethod ?? '').toLowerCase();
      const status = String(o?.orderStatus ?? '').toUpperCase();

      const orderDateValue = o?.orderDate ? new Date(o.orderDate) : null;
      const orderDate = orderDateValue && !isNaN(orderDateValue.getTime())
        ? this.toInputDate(orderDateValue)
        : '';

      const matchesSearch =
        !search ||
        orderId.includes(search) ||
        email.includes(search) ||
        name.includes(search) ||
        payment.includes(search);

      const matchesStatus =
        this.statusFilter === 'ALL' || status === this.statusFilter;

      const matchesFromDate =
        !this.fromDate || (orderDate && orderDate >= this.fromDate);

      const matchesToDate =
        !this.toDate || (orderDate && orderDate <= this.toDate);

      return matchesSearch && matchesStatus && matchesFromDate && matchesToDate;
    });
  }

  open(o: any): void {
    this.selected = o;
    this.newStatus = (o?.orderStatus || 'CONFIRMED') as OrderStatus;
    this.selectedItems = [];
    this.itemsError = '';
    this.itemsLoading = true;
    this.success = '';
    this.err = '';

    const id = Number(o?.id ?? 0);
    if (!id) {
      this.itemsLoading = false;
      this.itemsError = 'Invalid order id';
      return;
    }

    this.ordersApi.items(id).subscribe({
      next: (items: any[]) => {
        this.selectedItems = Array.isArray(items) ? items : [];
        this.itemsLoading = false;
      },
      error: (e: any) => {
        this.itemsLoading = false;
        this.itemsError = e?.error?.message || e?.error || 'Failed to load order items';
      }
    });
  }

  close(): void {
    if (this.saving) return;

    this.selected = null;
    this.selectedItems = [];
    this.itemsLoading = false;
    this.itemsError = '';
    this.newStatus = 'CONFIRMED';
  }

  saveStatus(): void {
    const id = Number(this.selected?.id ?? 0);
    if (!id || this.saving) return;

    this.saving = true;
    this.err = '';
    this.success = '';

    this.ordersApi.updateStatus(id, this.newStatus).subscribe({
      next: () => {
        this.success = 'Order status updated successfully';
        this.saving = false;
        this.close();
        this.load();
      },
      error: (e: any) => {
        this.saving = false;
        this.err = e?.error?.message || e?.error || 'Status update failed';
      }
    });
  }

  downloadCsv(): void {
    this.err = '';
    this.success = '';

    if (this.exporting) return;

    if (!this.fromDate || !this.toDate) {
      this.err = 'Please select from date and to date';
      return;
    }

    if (this.fromDate > this.toDate) {
      this.err = 'From date cannot be greater than To date';
      return;
    }

    this.exporting = true;

    this.ordersApi.exportAdminOrders(this.fromDate, this.toDate).subscribe({
      next: (data: Blob) => {
        const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = `admin_orders_${this.fromDate}_to_${this.toDate}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        window.URL.revokeObjectURL(url);
        this.exporting = false;
        this.success = 'Orders CSV downloaded successfully';
      },
      error: (e: any) => {
        this.exporting = false;
        this.err = e?.error?.message || e?.error || 'Failed to export orders';
      }
    });
  }

  badgeClass(s: OrderStatus): string {
    switch ((s || '').toUpperCase()) {
      case 'PENDING': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'CONFIRMED': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'SHIPPED': return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'DELIVERED': return 'bg-green-50 text-green-800 border-green-200';
      case 'CANCELLED': return 'bg-red-50 text-red-800 border-red-200';
      default: return 'bg-gray-50 text-gray-800 border-gray-200';
    }
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

  subtotal(it: any): string {
    const price = Number(it?.price ?? 0);
    const qty = Number(it?.quantity ?? 0);
    return this.money(price * qty);
  }
}