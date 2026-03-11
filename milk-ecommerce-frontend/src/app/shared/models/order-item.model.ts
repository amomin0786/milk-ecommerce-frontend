export interface OrderItem {
  productId: number;
  productName: string;
  productImageUrl?: string;
  price: number;
  quantity: number;
  subtotal: number;
  sellerName?: string;
}