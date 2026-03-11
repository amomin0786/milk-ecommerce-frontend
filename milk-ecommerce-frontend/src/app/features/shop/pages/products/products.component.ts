import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from 'src/app/core/services/product.service';
import { CartService } from 'src/app/core/services/cart.service';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html'
})
export class ProductsComponent implements OnInit {
  products: any[] = [];
  filtered: any[] = [];
  categories: string[] = ['All'];
  q = '';
  category = 'All';
  loading = false;
  error = '';

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = '';

    this.productService.getAll().subscribe({
      next: (res: any[]) => {
        console.log('API PRODUCTS:', res);

        this.products = res || [];
        this.filtered = [...this.products];

        const categoryNames = this.products
          .map((p: any) => p.categoryName)
          .filter((name: string | undefined | null) => !!name && name.trim() !== '');

        this.categories = ['All', ...Array.from(new Set(categoryNames))];
        this.loading = false;
      },
      error: (err) => {
        console.error('Load products error:', err);
        this.error = err?.error?.message || 'Failed to load products';
        this.loading = false;
      }
    });
  }

  addToCart(product: any): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.cartService.addToCart(product.id, 1).subscribe({
      next: () => {
        alert('Product added to cart');
      },
      error: (err) => {
        console.error('Add to cart error:', err);
        alert(err?.error?.message || 'Failed to add to cart');
      }
    });
  }

  applyFilters(): void {
    const search = this.q.trim().toLowerCase();

    this.filtered = this.products.filter((p: any) => {
      const matchesSearch =
        !search ||
        p.name?.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search);

      const productCategory = p.categoryName || '—';
      const matchesCategory =
        this.category === 'All' || productCategory === this.category;

      return matchesSearch && matchesCategory;
    });
  }

  ngDoCheck(): void {
    this.applyFilters();
  }
}