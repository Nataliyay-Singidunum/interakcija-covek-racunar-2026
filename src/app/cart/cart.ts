import { Component, signal } from '@angular/core';
import { UserModel } from '../../models/user.model';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-cart',
  imports: [RouterLink],
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
}
