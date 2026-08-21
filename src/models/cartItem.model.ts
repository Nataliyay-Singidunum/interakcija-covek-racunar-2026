import { ToyModel } from './toy.model';

export interface CartItemModel {
  item: ToyModel;
  quantity: number;
  status: 'na' | 'review pending' | 'reviewed';
}
