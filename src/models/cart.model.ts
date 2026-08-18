import { CartItemModel } from './cartItem.model';

export interface CartModel {
  cartId: string;
  cartItem: CartItemModel[];
  status: "active" | "ordered" | "abandoned";
}
