import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { UserModel } from '../../models/user.model';
import { OrderModel } from '../../models/order.model';
import { DecimalPipe } from '@angular/common';
import { Utils } from '../utils';
import { ToyService } from '../../services/toy.service';
import { ToyModel } from '../../models/toy.model';
import { TypeModel } from '../../models/type.model';
import { Toy } from '../toy/toy';

@Component({
  selector: 'app-profile',
  imports: [DecimalPipe, RouterLink],
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
    private utils: Utils,
  ) {
    if (!UserService.hasAuth()) {
      localStorage.setItem(UserService.TO_KEY, 'profile');
      this.router.navigateByUrl('/login');
      return;
    }
    this.activeUser.set(UserService.getActiveUser());
  }

  protected types: string[] = [];

  ngOnInit(): void {
    ToyService.getToys().then((rsp) => {
      const allTypes = rsp.data.map((toy) => toy.type.name);
      this.types = [...new Set(allTypes)];
      console.log(allTypes);
      console.log(this.types);
    });
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

  protected async getTypes() {
    const rsp = await ToyService.getToyTypes();
    const uniqueTypes: TypeModel[] = rsp.data;
    let typeList: string[] = [];
    for (let type of uniqueTypes) {
      typeList.push(type.name);
    }
    return typeList;
    console.log('Movie fetched successfully:', typeList);
  }

  protected showAddMenu: boolean = false;
  protected showRemoveMenu: boolean = false;
  toggleAddMenu() {
    this.showAddMenu = !this.showAddMenu;
    this.showRemoveMenu = false;
  }
  toggleRemoveMenu() {
    this.showRemoveMenu = !this.showRemoveMenu;
    this.showAddMenu = false;
  }

  getAvailableTypes(): string[] {
    const userFavorites = this.activeUser()?.favoriteTypes || [];
    return this.types.filter((t) => !userFavorites.includes(t));
  }

  addFavoriteType(newType: string) {
    const user = this.activeUser();
    if (user) {
      const currentFavorites = user.favoriteTypes ? [...user.favoriteTypes] : [];
      currentFavorites.push(newType);
      user.favoriteTypes = currentFavorites;
      this.activeUser.set(user);
      UserService.updateUserFavorites(user.email, currentFavorites);
      this.showAddMenu = false;
    }
  }

  removeFavoriteType(typeToRemove: string) {
    const user = this.activeUser();
    if (user && user.favoriteTypes) {
      const updatedFavorites = user.favoriteTypes.filter((t) => t !== typeToRemove);
      user.favoriteTypes = updatedFavorites;
      this.activeUser.set(user);
      UserService.updateUserFavorites(user.email, updatedFavorites);
      this.showRemoveMenu = false;
    }
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
