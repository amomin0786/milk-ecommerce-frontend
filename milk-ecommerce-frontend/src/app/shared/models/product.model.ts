export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;   // ✅ direct URL
  status?: string;

  category?: {
    id: number;
    categoryName: string;
  };

  seller?: {
    id: number;
    shopName?: string;
    businessName?: string;
  };
}