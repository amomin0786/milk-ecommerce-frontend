import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from 'src/app/core/services/cart.service';
import { PaymentMethod } from 'src/app/core/services/payment.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html'
})
export class CheckoutComponent implements OnInit {
  loading = false;
  err = '';

  paymentMethod: PaymentMethod = 'COD';

  items: any[] = [];
  amount = 0;

  customerName = '';
  customerPhone = '';
  shippingAddress = '';

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDraft();
    this.load();
  }

  load(): void {
    this.loading = true;
    this.err = '';

    this.cartService.getMyCart().subscribe({
      next: (items: any[]) => {
        this.items = items || [];
        this.amount = this.items.reduce((sum, i: any) => {
          const price = Number(i?.product?.price ?? i?.price ?? 0);
          const qty = Number(i?.quantity ?? 1);
          return sum + price * qty;
        }, 0);

        this.persistDraft();
        this.loading = false;
      },
      error: (e: any) => {
        this.loading = false;
        this.err = e?.error?.message || e?.error || 'Failed to load cart';
      }
    });
  }

  place(): void {
    this.err = '';

    if (!this.amount || this.amount <= 0) {
      this.err = 'Cart is empty. Please add items.';
      return;
    }

    if (!this.customerName.trim()) {
      this.err = 'Please enter customer name';
      return;
    }

    if (!this.customerPhone.trim()) {
      this.err = 'Please enter phone number';
      return;
    }

    if (!/^[0-9]{10}$/.test(this.customerPhone.trim())) {
      this.err = 'Phone number must be 10 digits';
      return;
    }

    if (!this.shippingAddress.trim()) {
      this.err = 'Please enter delivery address';
      return;
    }

    this.persistDraft();

    this.router.navigateByUrl('/shop/payment', {
      state: {
        amount: this.amount,
        method: this.paymentMethod,
        customerName: this.customerName.trim(),
        customerPhone: this.customerPhone.trim(),
        shippingAddress: this.shippingAddress.trim()
      }
    });
  }

  private persistDraft(): void {
    sessionStorage.setItem('checkout_amount', String(this.amount));
    sessionStorage.setItem('checkout_method', String(this.paymentMethod));
    sessionStorage.setItem('checkout_customer_name', this.customerName);
    sessionStorage.setItem('checkout_customer_phone', this.customerPhone);
    sessionStorage.setItem('checkout_shipping_address', this.shippingAddress);
  }

  private loadDraft(): void {
    this.customerName = sessionStorage.getItem('checkout_customer_name') || '';
    this.customerPhone = sessionStorage.getItem('checkout_customer_phone') || '';
    this.shippingAddress = sessionStorage.getItem('checkout_shipping_address') || '';
    this.paymentMethod = (sessionStorage.getItem('checkout_method') as PaymentMethod) || 'COD';
  }
}