import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { UserModel } from '../../models/user.model';
import { OrderModel } from '../../models/order.model';
import { DecimalPipe } from '@angular/common';
import { Utils } from '../utils';

@Component({
  selector: 'app-profile',
  imports: [DecimalPipe],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  protected activeUser = signal<UserModel | null>(null);
  protected statusMap = {
    na: 'Waiting',
    paid: 'Paid',
    cancelled: 'Cancelled',
    liked: 'Liked',
    disliked: 'Disliked',
  };

  constructor(
    private router: Router,
    private utils: Utils
  ) {
    if (!UserService.hasAuth()) {
      localStorage.setItem(UserService.TO_KEY, 'profile');
      this.router.navigateByUrl('/login');
      return;
    }
    this.activeUser.set(UserService.getActiveUser());
  }

  protected pay(order: OrderModel) {
    UserService.updateOrder(order.orderId, 'paid');
    this.activeUser.set(UserService.getActiveUser());
  }

  protected cancel(order: OrderModel) {
    UserService.updateOrder(order.orderId, 'cancelled');
    this.activeUser.set(UserService.getActiveUser());
  }

  protected like(order: OrderModel) {
    UserService.updateOrder(order.orderId, 'liked');
    this.activeUser.set(UserService.getActiveUser());
  }

  protected dislike(order: OrderModel) {
    UserService.updateOrder(order.orderId, 'disliked');
    this.activeUser.set(UserService.getActiveUser());
  }

  doLogout() {
    this.utils.showDialog(
      'Are you sure you want to logout?',
      () => {
        UserService.logout();
        this.router.navigate(['/login']);
      },
      'Logout',
      'Cancel',
    );
  }
}
