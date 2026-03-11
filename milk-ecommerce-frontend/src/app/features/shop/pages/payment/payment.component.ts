import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  PaymentMethod,
  PaymentService,
  PaymentInitiateResponse
} from 'src/app/core/services/payment.service';
import { OrderService, PlaceOrderPayload } from 'src/app/core/services/order.service';

declare var Razorpay: any;

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html'
})
export class PaymentComponent implements OnInit {
  loading = false;
  err = '';

  amount = 0;
  method: PaymentMethod = 'COD';

  orderId = 0;
  paymentId = 0;

  customerName = '';
  customerPhone = '';
  shippingAddress = '';

  constructor(
    private pay: PaymentService,
    private orders: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const st: any = history.state;

    if (typeof st?.amount === 'number') this.amount = st.amount;
    if (st?.method) this.method = st.method;

    if (st?.customerName) this.customerName = String(st.customerName);
    if (st?.customerPhone) this.customerPhone = String(st.customerPhone);
    if (st?.shippingAddress) this.shippingAddress = String(st.shippingAddress);

    if (!this.amount || this.amount <= 0) {
      const saved = Number(sessionStorage.getItem('checkout_amount') || 0);
      if (saved > 0) this.amount = saved;
    }

    const savedMethod = sessionStorage.getItem('checkout_method') as PaymentMethod | null;
    if (savedMethod) {
      this.method = savedMethod;
    }

    if (!this.customerName.trim()) {
      this.customerName = sessionStorage.getItem('checkout_customer_name') || '';
    }

    if (!this.customerPhone.trim()) {
      this.customerPhone = sessionStorage.getItem('checkout_customer_phone') || '';
    }

    if (!this.shippingAddress.trim()) {
      this.shippingAddress = sessionStorage.getItem('checkout_shipping_address') || '';
    }

    if (!this.amount || this.amount <= 0) {
      this.err = 'Checkout amount missing. Please go back.';
      return;
    }

    if (!this.shippingAddress.trim()) {
      this.err = 'Delivery address missing. Please go back to checkout.';
      return;
    }
  }

  goBack(): void {
    this.router.navigateByUrl('/shop/checkout');
  }

  setMethod(m: PaymentMethod): void {
    if (this.loading) return;
    this.method = m;
    this.err = '';
    sessionStorage.setItem('checkout_method', m);
  }

  startPayment(): void {
    this.err = '';
    this.loading = true;

    if (!this.amount || this.amount <= 0) {
      this.loading = false;
      this.err = 'Checkout amount is missing. Please go back to checkout and try again.';
      return;
    }

    if (!this.customerName.trim()) {
      this.loading = false;
      this.err = 'Customer name is missing. Please go back to checkout.';
      return;
    }

    if (!this.customerPhone.trim()) {
      this.loading = false;
      this.err = 'Phone number is missing. Please go back to checkout.';
      return;
    }

    if (!/^[0-9]{10}$/.test(this.customerPhone.trim())) {
      this.loading = false;
      this.err = 'Phone number must be 10 digits.';
      return;
    }

    if (!this.shippingAddress.trim()) {
      this.loading = false;
      this.err = 'Delivery address is missing. Please go back to checkout.';
      return;
    }

    const payload: PlaceOrderPayload = {
      paymentMethod: this.method,
      customerName: this.customerName.trim(),
      customerPhone: this.customerPhone.trim(),
      shippingAddress: this.shippingAddress.trim()
    };

    this.orders.placeOrder(payload).subscribe({
      next: (order: any) => {
        this.orderId = Number(order?.id ?? 0);

        if (!this.orderId) {
          this.loading = false;
          this.err = 'Order created but orderId missing from response.';
          return;
        }

        if (this.method === 'COD') {
          this.loading = false;
          this.clearCheckoutDraft();
          alert('Order placed with COD ✅');
          this.router.navigateByUrl('/shop/success', { state: { orderId: this.orderId } });
          return;
        }

        this.pay.initiate({ orderId: this.orderId, method: 'RAZORPAY' }).subscribe({
          next: (p: PaymentInitiateResponse) => {
            this.paymentId = Number(p?.paymentId ?? 0);

            if (!p?.keyId || !p?.providerOrderId) {
              this.loading = false;
              this.err = 'Razorpay order details missing from backend response.';
              return;
            }

            this.openRazorpay(p);
          },
          error: (e: any) => {
            this.loading = false;
            this.err =
              e?.error?.message ||
              (typeof e?.error === 'string' ? e.error : JSON.stringify(e?.error)) ||
              'Payment initiate failed';
          }
        });
      },
      error: (e: any) => {
        this.loading = false;
        this.err =
          e?.error?.message ||
          (typeof e?.error === 'string' ? e.error : JSON.stringify(e?.error)) ||
          'Order place failed';
      }
    });
  }

  private openRazorpay(p: PaymentInitiateResponse): void {
    const options = {
      key: p.keyId,
      amount: Math.round(Number(p.amount || 0) * 100),
      currency: p.currency || 'INR',
      name: 'Milk E-Commerce',
      description: `Order #${p.orderId}`,
      order_id: p.providerOrderId,
      handler: (response: any) => {
        this.pay.verifyRazorpay({
          paymentId: this.paymentId,
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature
        }).subscribe({
          next: (res) => {
            this.loading = false;

            if (!res?.verified) {
              this.err = res?.message || 'Payment verification failed';
              return;
            }

            this.clearCheckoutDraft();
            alert('Payment successful ✅');
            this.router.navigateByUrl('/shop/success', { state: { orderId: this.orderId } });
          },
          error: (e: any) => {
            this.loading = false;
            this.err =
              e?.error?.message ||
              (typeof e?.error === 'string' ? e.error : JSON.stringify(e?.error)) ||
              'Payment verification failed';
          }
        });
      },
      modal: {
        ondismiss: () => {
          this.loading = false;
          this.err = 'Payment cancelled by user.';
        }
      },
      prefill: {
        name: this.customerName || '',
        contact: this.customerPhone || ''
      },
      notes: {
        shippingAddress: this.shippingAddress || ''
      },
      theme: {
        color: '#000000'
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();
  }

  private clearCheckoutDraft(): void {
    sessionStorage.removeItem('checkout_amount');
    sessionStorage.removeItem('checkout_method');
    sessionStorage.removeItem('checkout_customer_name');
    sessionStorage.removeItem('checkout_customer_phone');
    sessionStorage.removeItem('checkout_shipping_address');
  }
}