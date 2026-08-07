export interface OrderModel {
  orderId: string;
  movieId: number;
  time: string;
  cinema: string;
  hall: string;
  quantity: number;
  price: number;
  status: 'na' | 'paid' | 'cancelled' | 'liked' | 'disliked';
}
