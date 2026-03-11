import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from 'src/app/core/services/product.service';

@Component({
  selector: 'app-seller-products',
  templateUrl: './seller-products.component.html'
})
export class SellerProductsComponent implements OnInit {
  products: any[] = [];
  filtered: any[] = [];

  loading = false;
  saving = false;
  deletingId: number | null = null;

  error = '';
  success = '';

  q = '';
  statusFilter = 'ALL';
  stockFilter = 'ALL';

  stockModalOpen = false;
  stockProduct: any = null;
  stockValue: number | null = null;

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = '';
    this.success = '';

    this.productService.getMyProducts().subscribe({
      next: (res: any) => {
        this.products = Array.isArray(res) ? res : [];
        this.applyFilters();
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err?.error?.message || err?.error || 'Failed to load seller products';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    const search = (this.q || '').trim().toLowerCase();

    this.filtered = this.products.filter((p: any) => {
      const name = String(p?.name || '').toLowerCase();
      const desc = String(p?.description || '').toLowerCase();
      const category = String(p?.categoryName || p?.category?.categoryName || '').toLowerCase();
      const status = String(p?.status || '').toUpperCase();
      const stock = Number(p?.stock ?? 0);

      const matchesSearch =
        !search ||
        name.includes(search) ||
        desc.includes(search) ||
        category.includes(search);

      const matchesStatus =
        this.statusFilter === 'ALL' || status === this.statusFilter;

      const matchesStock =
        this.stockFilter === 'ALL' ||
        (this.stockFilter === 'LOW' && stock > 0 && stock <= 5) ||
        (this.stockFilter === 'OUT' && stock <= 0) ||
        (this.stockFilter === 'OK' && stock > 5);

      return matchesSearch && matchesStatus && matchesStock;
    });
  }

  goToAdd(): void {
    this.router.navigate(['/seller/products/add']);
  }

  editProduct(id: number): void {
    this.router.navigate(['/seller/products/edit', id]);
  }

  deleteProduct(id: number): void {
    if (!id || this.deletingId) return;

    const ok = confirm('Are you sure you want to delete this product?');
    if (!ok) return;

    this.error = '';
    this.success = '';
    this.deletingId = id;

    this.productService.deleteMyProduct(id).subscribe({
      next: () => {
        this.success = 'Product deleted successfully';
        this.deletingId = null;
        this.loadProducts();
      },
      error: (err: any) => {
        this.error = err?.error?.message || err?.error || 'Failed to delete product';
        this.deletingId = null;
      }
    });
  }

  openStockModal(product: any): void {
    this.stockProduct = product;
    this.stockValue = Number(product?.stock ?? 0);
    this.stockModalOpen = true;
    this.error = '';
    this.success = '';
  }

  closeStockModal(): void {
    if (this.saving) return;
    this.stockModalOpen = false;
    this.stockProduct = null;
    this.stockValue = null;
  }

  saveStock(): void {
    const productId = Number(this.stockProduct?.id ?? 0);
    const stock = Number(this.stockValue);

    if (!productId) {
      this.error = 'Invalid product';
      return;
    }

    if (Number.isNaN(stock) || stock < 0) {
      this.error = 'Please enter a valid stock value';
      return;
    }

    this.error = '';
    this.success = '';
    this.saving = true;

    this.productService.updateMyProductStock(productId, { stock }).subscribe({
      next: () => {
        this.success = 'Stock updated successfully';
        this.saving = false;
        this.closeStockModal();
        this.loadProducts();
      },
      error: (err: any) => {
        this.error = err?.error?.message || err?.error || 'Failed to update stock';
        this.saving = false;
      }
    });
  }

  badgeClass(status: string): string {
    const s = String(status || '').toUpperCase();

    if (s === 'ACTIVE') return 'bg-green-50 text-green-700 border-green-200';
    if (s === 'INACTIVE') return 'bg-red-50 text-red-700 border-red-200';

    return 'bg-gray-50 text-gray-700 border-gray-200';
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

  lowStockCount(): number {
    return this.products.filter((p: any) => {
      const n = Number(p?.stock ?? 0);
      return n > 0 && n <= 5;
    }).length;
  }

  outOfStockCount(): number {
    return this.products.filter((p: any) => Number(p?.stock ?? 0) <= 0).length;
  }

  money(v: any): string {
    const n = Number(v ?? 0);
    return isNaN(n) ? '0.00' : n.toFixed(2);
  }

  imageUrl(product: any): string {
    return product?.imageUrl || 'https://via.placeholder.com/160x120?text=No+Image';
  }
}