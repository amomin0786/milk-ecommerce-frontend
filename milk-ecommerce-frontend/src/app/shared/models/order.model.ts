export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id: number;
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentMethod: 'COD' | 'UPI' | 'CARD' | string;

  orderDate?: string;        // Timestamp from backend
  paidDate?: string;
  shippedDate?: string;
  deliveryDate?: string;
  cancelledDate?: string;
  updatedAt?: string;

  cancelReason?: string;
  refundStatus?: string;
  refundAmount?: number;
  refundReason?: string;
  refundedDate?: string;
}