import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-success',
  templateUrl: './order-success.component.html'
})
export class OrderSuccessComponent {
  orderId = Number(history.state?.orderId ?? 0);

  constructor(private router: Router) {}

  goOrders(): void {
    this.router.navigateByUrl('/user/my-orders');
  }

  goShop(): void {
    this.router.navigateByUrl('/shop/products');
  }
}