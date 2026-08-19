import { Component, signal } from '@angular/core';
import { UserModel } from '../../models/user.model';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-cart',
  imports: [DecimalPipe],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
  protected activeUser = signal<UserModel | null>(null);

  constructor(private router: Router) {
    if (!UserService.hasAuth()) {
      localStorage.setItem(UserService.TO_KEY, 'profile');
      this.router.navigateByUrl('/login');
      return;
    }
    this.activeUser.set(UserService.getActiveUser());
  }
  protected checkOut() {
    UserService.createOrder();
    this.router.navigateByUrl('/profile');
  }

  protected getTotalPrice() {
    const user = this.activeUser();
    if (!user) return 0;

    const activeOrder = user.data.find((order) => order.items.status === 'active');
    if (!activeOrder || !activeOrder.items.cartItems) return 0;

    let total = 0;
    for (let item of activeOrder.items.cartItems) {
      total += item.quantity * item.item.price;
    }

    return total;
  }
}
