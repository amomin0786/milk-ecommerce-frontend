import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from 'src/app/core/services/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {

  items: any[] = [];
  updating = false;

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.cartService.getMyCart().subscribe({
      next: (data: any[]) => (this.items = data || []),
      error: (e: any) => alert(e?.error?.message || e?.error || 'Failed to load cart (login required?)')
    });
  }

  inc(i: any): void {
    if (!i || this.updating) return;

    const current = Number(i?.quantity ?? 1);
    const nextQty = current + 1;

    this.updating = true;
    this.cartService.updateQty(i.id, nextQty).subscribe({
      next: () => {
        this.updating = false;
        this.load();
      },
      error: (e: any) => {
        this.updating = false;
        alert(e?.error?.message || e?.error || 'Qty update failed');
      }
    });
  }

  dec(i: any): void {
    if (!i || this.updating) return;

    const current = Number(i?.quantity ?? 1);
    const nextQty = Math.max(1, current - 1);

    this.updating = true;
    this.cartService.updateQty(i.id, nextQty).subscribe({
      next: () => {
        this.updating = false;
        this.load();
      },
      error: (e: any) => {
        this.updating = false;
        alert(e?.error?.message || e?.error || 'Qty update failed');
      }
    });
  }

  remove(i: any): void {
    if (!i || this.updating) return;

    this.updating = true;
    this.cartService.remove(i.id).subscribe({
      next: () => {
        this.updating = false;
        this.load();
      },
      error: (e: any) => {
        this.updating = false;
        alert(e?.error?.message || e?.error || 'Remove failed');
      }
    });
  }

  get total(): number {
    return (this.items || []).reduce((sum, i: any) => {
      const price = Number(i?.product?.price ?? i?.price ?? 0);
      const qty = Number(i?.quantity ?? 1);
      return sum + price * qty;
    }, 0);
  }

  checkout(): void {
    this.router.navigateByUrl('/shop/checkout');
  }
}