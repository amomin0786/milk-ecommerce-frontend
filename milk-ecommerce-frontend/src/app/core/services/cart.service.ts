import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface CartItem {
  id: number;
  quantity: number;
  totalPrice: number;
  product: {
    id: number;
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    stock?: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  constructor(private api: ApiService) {}

  getMyCart(): Observable<CartItem[]> {
    return this.api.get<CartItem[]>('/api/cart/my');
  }

  getCart(): Observable<CartItem[]> {
    return this.getMyCart();
  }

  addToCart(productId: number, quantity: number = 1): Observable<CartItem> {
    return this.api.post<CartItem>(`/api/cart/add/${productId}?qty=${quantity}`, {});
  }

  updateQty(cartId: number, quantity: number): Observable<CartItem> {
    return this.api.put<CartItem>(`/api/cart/update/${cartId}?qty=${quantity}`, {});
  }

  updateCartItem(cartId: number, quantity: number): Observable<CartItem> {
    return this.updateQty(cartId, quantity);
  }

  remove(cartId: number): Observable<string> {
    return this.api.delete<string>(`/api/cart/remove/${cartId}`);
  }

  removeFromCart(cartId: number): Observable<string> {
    return this.remove(cartId);
  }
}