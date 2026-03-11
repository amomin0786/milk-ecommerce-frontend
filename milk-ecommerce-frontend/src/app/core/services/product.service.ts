import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Product } from 'src/app/shared/models/product.model';

export interface SellerProductRequest {
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId?: number | null;
  imageUrl?: string;
  status?: string;
}

export interface UpdateStockRequest {
  stock: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private api: ApiService) {}

  getAll(): Observable<Product[]> {
    return this.api.get<Product[]>('/api/products/all');
  }

  getMyProducts(): Observable<Product[]> {
    return this.api.get<Product[]>('/api/seller/products');
  }

  getMyProductById(id: number): Observable<Product> {
    return this.api.get<Product>(`/api/seller/products/${id}`);
  }

  createMyProduct(body: SellerProductRequest): Observable<Product> {
    return this.api.post<Product>('/api/seller/products', body);
  }

  updateMyProduct(id: number, body: SellerProductRequest): Observable<Product> {
    return this.api.put<Product>(`/api/seller/products/${id}`, body);
  }

  updateMyProductStock(id: number, body: UpdateStockRequest): Observable<Product> {
    return this.api.patch<Product>(`/api/seller/products/${id}/stock`, body);
  }

  deleteMyProduct(id: number): Observable<string> {
    return this.api.delete<string>(`/api/seller/products/${id}`);
  }
}