import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, SellerProductRequest } from 'src/app/core/services/product.service';
import { ApiService } from 'src/app/core/services/api.service';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html'
})
export class AddProductComponent implements OnInit {
  productId: number | null = null;
  loading = false;
  submitting = false;
  error = '';
  success = '';

  categories: any[] = [];

  form: SellerProductRequest = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    categoryId: null,
    imageUrl: '',
    status: 'ACTIVE'
  };

  constructor(
    private productService: ProductService,
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.productId = id ? Number(id) : null;

    this.loadCategories();

    if (this.productId) {
      this.loadProduct(this.productId);
    }
  }

  get isEditMode(): boolean {
    return !!this.productId;
  }

  loadCategories(): void {
    this.api.get<any[]>('/api/categories').subscribe({
      next: (res) => {
        const all = Array.isArray(res) ? res : [];
        this.categories = all.filter((c: any) => String(c?.status || '').toUpperCase() !== 'INACTIVE');
      },
      error: (err: any) => {
        console.error('Load categories error:', err);
        this.error = err?.error?.message || err?.error || 'Failed to load categories';
        this.categories = [];
      }
    });
  }

  loadProduct(id: number): void {
    this.loading = true;
    this.error = '';

    this.productService.getMyProductById(id).subscribe({
      next: (res: any) => {
        this.form = {
          name: res?.name || '',
          description: res?.description || '',
          price: Number(res?.price ?? 0),
          stock: Number(res?.stock ?? 0),
          categoryId: res?.categoryId ?? res?.category?.id ?? null,
          imageUrl: res?.imageUrl || '',
          status: res?.status || 'ACTIVE'
        };
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Load product error:', err);
        this.error = err?.error?.message || err?.error || 'Failed to load product';
        this.loading = false;
      }
    });
  }

  submit(): void {
    this.error = '';
    this.success = '';

    this.form.name = String(this.form.name || '').trim();
    this.form.description = String(this.form.description || '').trim();
    this.form.imageUrl = String(this.form.imageUrl || '').trim();
    this.form.status = String(this.form.status || 'ACTIVE').toUpperCase();

    if (!this.form.name) {
      this.error = 'Product name is required';
      return;
    }

    if (this.form.name.length < 2) {
      this.error = 'Product name must be at least 2 characters';
      return;
    }

    if (Number(this.form.price) <= 0) {
      this.error = 'Price must be greater than 0';
      return;
    }

    if (Number(this.form.stock) < 0) {
      this.error = 'Stock cannot be negative';
      return;
    }

    if (!this.form.categoryId) {
      this.error = 'Please select a category';
      return;
    }

    this.submitting = true;

    if (this.isEditMode && this.productId) {
      this.productService.updateMyProduct(this.productId, this.form).subscribe({
        next: () => {
          this.submitting = false;
          this.success = 'Product updated successfully';
          setTimeout(() => this.router.navigate(['/seller/products']), 800);
        },
        error: (err: any) => {
          console.error('Update product error:', err);
          this.submitting = false;
          this.error = err?.error?.message || err?.error || 'Failed to update product';
        }
      });
    } else {
      this.productService.createMyProduct(this.form).subscribe({
        next: () => {
          this.submitting = false;
          this.success = 'Product added successfully';
          setTimeout(() => this.router.navigate(['/seller/products']), 800);
        },
        error: (err: any) => {
          console.error('Add product error:', err);
          this.submitting = false;
          this.error = err?.error?.message || err?.error || 'Failed to add product';
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/seller/products']);
  }

  previewImage(): string {
    const url = String(this.form.imageUrl || '').trim();
    return url || 'https://via.placeholder.com/320x220?text=Product+Preview';
  }
}