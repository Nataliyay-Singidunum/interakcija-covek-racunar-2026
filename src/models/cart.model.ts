import { CartItemModel } from './cartItem.model';

export interface CartModel {
  cartId: string;
  cartItems: CartItemModel[];
  status: "active" | "ordered" | "abandoned";
}
