import { CartModel } from './cart.model';

export interface OrderModel {
  orderId: string;
  items: CartModel;
  time: Date;
  status:
    | 'na'
    | 'pay later'
    | 'paid'
    | 'cancelled'
    | 'preparing'
    | 'out for delivery'
    | 'delivered'
    | 'waiting for review'
    | 'reviewed';
}
