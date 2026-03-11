import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/core/services/admin.service';

@Component({
  selector: 'app-admin-sellers',
  templateUrl: './admin-sellers.component.html'
})
export class AdminSellersComponent implements OnInit {
  sellers: any[] = [];
  filtered: any[] = [];

  loading = false;
  err = '';
  success = '';

  q = '';
  statusFilter = 'ALL';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadSellers();
  }

  loadSellers(): void {
    this.loading = true;
    this.err = '';
    this.success = '';

    this.adminService.getAllSellers().subscribe({
      next: (res: any[]) => {
        this.sellers = Array.isArray(res) ? res : [];
        this.applyFilter();
        this.loading = false;
      },
      error: (error: any) => {
        this.err = error?.error?.message || error?.error || 'Failed to load sellers';
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    const term = (this.q || '').trim().toLowerCase();

    this.filtered = this.sellers.filter((s: any) => {
      const id = String(s?.id ?? '').toLowerCase();
      const userName = String(s?.userName ?? '').toLowerCase();
      const email = String(s?.userEmail ?? '').toLowerCase();
      const shop = String(s?.shopName ?? '').toLowerCase();
      const gst = String(s?.gstNumber ?? '').toLowerCase();
      const status = String(s?.approvalStatus ?? '').toUpperCase();

      const matchesSearch =
        !term ||
        id.includes(term) ||
        userName.includes(term) ||
        email.includes(term) ||
        shop.includes(term) ||
        gst.includes(term) ||
        status.toLowerCase().includes(term);

      const matchesStatus =
        this.statusFilter === 'ALL' || status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  badgeClass(status: string): string {
    const s = String(status || '').toUpperCase();

    if (s === 'APPROVED') return 'bg-green-50 text-green-700 border-green-200';
    if (s === 'PENDING') return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    if (s === 'REJECTED') return 'bg-red-50 text-red-700 border-red-200';

    return 'bg-gray-50 text-gray-700 border-gray-200';
  }

  formatDate(value: any): string {
    if (!value) return '-';

    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);

    return d.toLocaleString();
  }

  money(v: any): string {
    const n = Number(v ?? 0);
    return isNaN(n) ? '0.00' : n.toFixed(2);
  }
}