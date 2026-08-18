import { CartModel } from './cart.model';

export interface OrderModel {
  orderId: string;
  items: CartModel;
  time: Date;
  status: 'na' | 'paid' | 'cancelled' | 'liked' | 'disliked' ;
}
