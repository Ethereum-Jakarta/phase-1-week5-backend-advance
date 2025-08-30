export interface Order {
  id: string;
  userId: string;
  products: Array<{
      productId: string;
      quantity: number;
  }>;
  status: 'pending' | 'completed' | 'cancelled';
  totalAmount: number;
}