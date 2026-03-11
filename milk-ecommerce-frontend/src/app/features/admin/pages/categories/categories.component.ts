import { Component, OnInit } from '@angular/core';
import { CategoryService } from 'src/app/core/services/category.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html'
})
export class CategoriesComponent implements OnInit {
  loading = false;
  err = '';
  success = '';

  categories: any[] = [];
  filtered: any[] = [];
  q = '';
  statusFilter = 'ALL';

  form = {
    categoryName: '',
    status: 'ACTIVE',
    description: ''
  };

  editingId: number | null = null;
  saving = false;
  deletingId: number | null = null;

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.err = '';
    this.success = '';

    this.categoryService.getAll().subscribe({
      next: (res: any[]) => {
        this.categories = Array.isArray(res) ? res : [];
        this.categories.sort((a, b) =>
          String(a?.categoryName || '').localeCompare(String(b?.categoryName || ''))
        );
        this.applyFilters();
        this.loading = false;
      },
      error: (e: any) => {
        this.err = e?.error?.message || e?.error || 'Failed to load categories';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    const search = (this.q || '').trim().toLowerCase();

    this.filtered = this.categories.filter((c: any) => {
      const name = String(c?.categoryName || '').toLowerCase();
      const desc = String(c?.description || '').toLowerCase();
      const status = String(c?.status || '').toUpperCase();

      const matchesSearch =
        !search ||
        name.includes(search) ||
        desc.includes(search);

      const matchesStatus =
        this.statusFilter === 'ALL' || status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  edit(c: any): void {
    this.editingId = Number(c?.id ?? 0);
    this.form = {
      categoryName: c?.categoryName || '',
      status: c?.status || 'ACTIVE',
      description: c?.description || ''
    };
    this.err = '';
    this.success = '';
  }

  resetForm(): void {
    this.editingId = null;
    this.form = {
      categoryName: '',
      status: 'ACTIVE',
      description: ''
    };
    this.saving = false;
  }

  save(): void {
    this.err = '';
    this.success = '';

    if (!this.form.categoryName.trim()) {
      this.err = 'Category name is required';
      return;
    }

    this.saving = true;

    const body = {
      categoryName: this.form.categoryName.trim(),
      status: (this.form.status || 'ACTIVE').trim().toUpperCase(),
      description: this.form.description?.trim() || ''
    };

    if (this.editingId) {
      this.categoryService.updateCategory(this.editingId, body).subscribe({
        next: () => {
          this.success = 'Category updated successfully';
          this.saving = false;
          this.resetForm();
          this.load();
        },
        error: (e: any) => {
          this.err = e?.error?.message || e?.error || 'Failed to update category';
          this.saving = false;
        }
      });
    } else {
      this.categoryService.addCategory(body).subscribe({
        next: () => {
          this.success = 'Category added successfully';
          this.saving = false;
          this.resetForm();
          this.load();
        },
        error: (e: any) => {
          this.err = e?.error?.message || e?.error || 'Failed to add category';
          this.saving = false;
        }
      });
    }
  }

  remove(id: number): void {
    if (!id || this.deletingId) return;
    if (!confirm('Delete this category?')) return;

    this.err = '';
    this.success = '';
    this.deletingId = id;

    this.categoryService.deleteCategory(id).subscribe({
      next: () => {
        this.success = 'Category deleted successfully';
        this.deletingId = null;
        this.load();
      },
      error: (e: any) => {
        this.err = e?.error?.message || e?.error || 'Failed to delete category';
        this.deletingId = null;
      }
    });
  }

  badgeClass(status: string): string {
    const s = (status || '').toUpperCase();

    if (s === 'ACTIVE') return 'bg-green-50 text-green-800 border-green-200';
    if (s === 'INACTIVE') return 'bg-red-50 text-red-800 border-red-200';

    return 'bg-gray-50 text-gray-800 border-gray-200';
  }
}