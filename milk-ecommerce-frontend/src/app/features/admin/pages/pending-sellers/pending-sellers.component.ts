import { Component, OnInit } from '@angular/core';
import { SellerService } from 'src/app/core/services/seller.service';

@Component({
  selector: 'app-pending-sellers',
  templateUrl: './pending-sellers.component.html'
})
export class PendingSellersComponent implements OnInit {
  sellers: any[] = [];
  loading = false;
  actionId: number | null = null;
  err = '';
  success = '';

  constructor(private sellerService: SellerService) {}

  ngOnInit(): void {
    this.loadPendingSellers();
  }

  loadPendingSellers(): void {
    this.loading = true;
    this.err = '';
    this.success = '';

    this.sellerService.pendingSellers().subscribe({
      next: (res: any) => {
        this.sellers = Array.isArray(res) ? res : [];
        this.loading = false;
      },
      error: (error: any) => {
        this.err = error?.error?.message || error?.error || 'Failed to load pending sellers';
        this.loading = false;
      }
    });
  }

  approve(id: number): void {
    if (!id || this.actionId) return;

    this.err = '';
    this.success = '';
    this.actionId = id;

    this.sellerService.approveSeller(id).subscribe({
      next: () => {
        this.success = 'Seller approved successfully';
        this.actionId = null;
        this.loadPendingSellers();
      },
      error: (error: any) => {
        this.err = error?.error?.message || error?.error || 'Failed to approve seller';
        this.actionId = null;
      }
    });
  }

  reject(id: number): void {
    if (!id || this.actionId) return;

    this.err = '';
    this.success = '';
    this.actionId = id;

    this.sellerService.rejectSeller(id).subscribe({
      next: () => {
        this.success = 'Seller rejected successfully';
        this.actionId = null;
        this.loadPendingSellers();
      },
      error: (error: any) => {
        this.err = error?.error?.message || error?.error || 'Failed to reject seller';
        this.actionId = null;
      }
    });
  }

  formatDate(value: any): string {
    if (!value) return '-';

    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);

    return d.toLocaleString();
  }
}