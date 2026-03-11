import { Component } from '@angular/core';
import { SellerService } from 'src/app/core/services/seller.service';

@Component({
  selector: 'app-seller-apply',
  templateUrl: './seller-apply.component.html'
})
export class SellerApplyComponent {
  loading = false;
  err = '';
  success = '';

  form = {
    shopName: '',
    gstNumber: ''
  };

  constructor(private sellerService: SellerService) {}

  submit(): void {
    this.err = '';
    this.success = '';

    const shopName = String(this.form.shopName || '').trim();
    const gstNumber = String(this.form.gstNumber || '').trim().toUpperCase();

    if (!shopName) {
      this.err = 'Shop name is required';
      return;
    }

    if (shopName.length < 2) {
      this.err = 'Shop name must be at least 2 characters';
      return;
    }

    if (gstNumber && gstNumber.length < 5) {
      this.err = 'Please enter a valid GST number';
      return;
    }

    this.loading = true;

    this.sellerService.applySeller({
      shopName,
      gstNumber
    }).subscribe({
      next: () => {
        this.success = 'Seller application submitted successfully';
        this.loading = false;
        this.form = {
          shopName: '',
          gstNumber: ''
        };
      },
      error: (e: any) => {
        this.err = e?.error?.message || e?.error || 'Failed to submit seller application';
        this.loading = false;
      }
    });
  }
}