export interface OrderModel {
  orderId: string;
  movieId: number;
  movieTitle: string;
  time: string;
  cinema: string;
  hall: string;
  quantity: number;
  status: 'na' | 'paid' | 'cancelled' | 'liked' | 'disliked';
}
