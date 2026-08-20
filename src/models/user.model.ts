import { OrderModel } from './order.model';

export interface UserModel {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  favoriteTypes: string[];
  password: string;
  data: OrderModel[];
}
