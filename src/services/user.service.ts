import { UserModel } from '../models/user.model';
import { OrderModel } from '../models/order.model';
import { ToyModel } from '../models/toy.model';
import { CartItemModel } from '../models/cartItem.model';
import { v4 as uuidv4 } from 'uuid';
import { CartModel } from '../models/cart.model';

export class UserService {
  public static USERS_KEY = 'icr_users';
  public static ACTIVE_KEY = 'icr_active';
  public static TO_KEY = 'icr_to';

  static getUsers(): UserModel[] {
    if (!localStorage.getItem(this.USERS_KEY)) {
      localStorage.setItem(
        this.USERS_KEY,
        JSON.stringify([
          {
            firstName: 'Example',
            lastName: 'User',
            email: 'user@example.com',
            phone: '+381 321321',
            address: 'Adresa 1',
            favoriteTypes: [],
            password: 'user123',
            data: [
              {
                orderId: 1,
                items: {
                  cartId: 1,
                  cartItems: [
                    {
                      item: {
                        toyId: 1,
                        name: 'Drvena slagalica životinje',
                        permalink: 'drvena-slagalica-zivotinje',
                        description: 'Edukativna drvena slagalica sa motivima životinja.',
                        targetGroup: 'svi',
                        productionDate: '2024-03-10',
                        price: 1499,
                        imageUrl: '/img/1.png',
                        ageGroup: {
                          ageGroupId: 2,
                          name: '3-5',
                          description: 'Predškolci, razvoj fine motorike i kreativnosti.',
                        },
                        type: {
                          typeId: 1,
                          name: 'Slagalica',
                          description: 'Igračka koja razvija logiku i motoričke veštine.',
                        },
                      },
                      quantity: 3,
                    },
                  ],
                  status: 'active',
                },
                status: 'na',
              },
            ],
          },
        ]),
      );
    }
    return JSON.parse(localStorage.getItem(this.USERS_KEY)!);
  }

  static findUserByEmail(email: string) {
    const users = this.getUsers();
    const selectedUser = users.find((user) => user.email === email);

    if (!selectedUser) {
      throw new Error('User_not_found');
    } else {
      return selectedUser;
    }
  }

  static login(email: string, password: string) {
    try {
      const user = this.findUserByEmail(email);
      if (user.password == password) {
        localStorage.setItem(this.ACTIVE_KEY, user.email);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  static hasAuth() {
    return localStorage.getItem(this.ACTIVE_KEY) !== null;
  }

  static getActiveUser() {
    if (!this.hasAuth()) {
      throw new Error();
    }
    return this.findUserByEmail(localStorage.getItem(this.ACTIVE_KEY)!);
  }

  static logout() {
    localStorage.removeItem(this.ACTIVE_KEY);
  }

  static createCartItem(item: CartItemModel) {
    const current = localStorage.getItem(this.ACTIVE_KEY);
    const all = this.getUsers();

    for (let u of all) {
      if (u.email === current) {
        for (let order of u.data) {
          if (order.items.status === 'active') {
            order.items.cartItems.push(item);
          }
        }
      }
    }
    localStorage.setItem(this.USERS_KEY, JSON.stringify(all));
  }

  static createOrder() {
    const current = localStorage.getItem(this.ACTIVE_KEY);
    const all = this.getUsers();

    for (let user of all) {
      if (user.email === current) {
        // turn cart into order
        for (let order of user.data) {
          if (order.items.status === 'active') {
            order.orderId = uuidv4();
            order.items.status = 'ordered';
            order.time = new Date();
            order.status = 'na';
          }
        }

        let newCart: OrderModel = {
          orderId: uuidv4(),
          items: {
            cartId: uuidv4(),
            cartItems: [],
            status: 'active',
          },
          time: new Date(),
          status: 'na',
        };

        user.data.push(newCart);
      }
    }

    localStorage.setItem(this.USERS_KEY, JSON.stringify(all));
  }

  // Movie v

  static createReservation(order: OrderModel) {
    const current = localStorage.getItem(this.ACTIVE_KEY);
    const all = this.getUsers();

    for (let u of all) {
      if (u.email === current) {
        u.data.push(order);
      }
    }
    localStorage.setItem(this.USERS_KEY, JSON.stringify(all));
  }

  static updateOrder(orderId: string, status: 'na' | 'paid' | 'cancelled' | 'liked' | 'disliked') {
    const all = this.getUsers();

    for (let u of all) {
      for (let o of u.data) {
        if (o.orderId === orderId) {
          o.status = status;
        }
      }
    }
    localStorage.setItem(this.USERS_KEY, JSON.stringify(all));
  }

  static updateUser(updatedUser: { firstName: string; lastName: string; email: string; phone: string; address: string; }) {
    const currentEmail = localStorage.getItem(this.ACTIVE_KEY);

    if (!currentEmail) {
      throw new Error('No active user session found.');
    }

    const allUsers = this.getUsers();

    for (let user of allUsers) {
      if (user.email === currentEmail) {
        // 1. Update primitive profile fields one by one
        user.firstName = updatedUser.firstName;
        user.lastName = updatedUser.lastName;
        user.phone = updatedUser.phone;
        user.address = updatedUser.address;


        if (user.email !== updatedUser.email) {
          user.email = updatedUser.email;
          localStorage.setItem(this.ACTIVE_KEY, user.email);
        }

        break; // Stop looping once we found and updated our user
      }
    }

    // 3. Save the entire updated array back to local storage
    localStorage.setItem(this.USERS_KEY, JSON.stringify(allUsers));

  }
}
