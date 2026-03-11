import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/core/services/admin.service';

@Component({
  selector: 'app-admin-products',
  templateUrl: './admin-products.component.html'
})
export class AdminProductsComponent implements OnInit {
  loading = false;
  saving = false;
  err = '';
  success = '';

  products: any[] = [];
  filtered: any[] = [];

  q = '';
  statusFilter = 'ALL';

  selected: any = null;
  newStatus = 'ACTIVE';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.err = '';
    this.success = '';

    this.adminService.getAllProducts().subscribe({
      next: (res: any[]) => {
        this.products = Array.isArray(res) ? res : [];
        this.applyFilters();
        this.loading = false;
      },
      error: (e: any) => {
        this.err = e?.error?.message || e?.error || 'Failed to load products';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    const search = (this.q || '').trim().toLowerCase();

    this.filtered = this.products.filter((p: any) => {
      const name = String(p?.name || '').toLowerCase();
      const desc = String(p?.description || '').toLowerCase();
      const seller = String(p?.sellerShopName || p?.sellerUserName || '').toLowerCase();
      const email = String(p?.sellerUserEmail || '').toLowerCase();
      const category = String(p?.categoryName || '').toLowerCase();
      const status = String(p?.status || '').toUpperCase();

      const matchesSearch =
        !search ||
        name.includes(search) ||
        desc.includes(search) ||
        seller.includes(search) ||
        email.includes(search) ||
        category.includes(search);

      const matchesStatus =
        this.statusFilter === 'ALL' || status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  open(product: any): void {
    this.selected = product;
    this.newStatus = product?.status || 'ACTIVE';
    this.err = '';
    this.success = '';
  }

  close(): void {
    if (this.saving) return;
    this.selected = null;
  }

  saveStatus(): void {
    const id = Number(this.selected?.id ?? 0);
    if (!id) return;

    this.saving = true;
    this.err = '';
    this.success = '';

    this.adminService.updateProductStatus(id, this.newStatus).subscribe({
      next: () => {
        this.success = 'Product status updated successfully';
        this.saving = false;
        this.close();
        this.load();
      },
      error: (e: any) => {
        this.err = e?.error?.message || e?.error || 'Status update failed';
        this.saving = false;
      }
    });
  }

  badgeClass(status: string): string {
    const s = (status || '').toUpperCase();

    if (s === 'ACTIVE') return 'bg-green-50 text-green-800 border-green-200';
    if (s === 'INACTIVE') return 'bg-red-50 text-red-800 border-red-200';

    return 'bg-gray-50 text-gray-800 border-gray-200';
  }

  stockClass(stock: any): string {
    const n = Number(stock ?? 0);

    if (n <= 0) return 'text-red-700';
    if (n <= 5) return 'text-yellow-700';

    return 'text-gray-900';
  }

  money(value: any): string {
    const n = Number(value ?? 0);
    return isNaN(n) ? '0.00' : n.toFixed(2);
  }
}