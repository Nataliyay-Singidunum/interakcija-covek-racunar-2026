import { Component, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToyModel } from '../../models/toy.model';
import { ToyService } from '../../services/toy.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Utils } from '../utils';
import { UserService } from '../../services/user.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-toy',
  imports: [RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './toy.html',
  styleUrl: './toy.css',
})
export class Toy {
  protected toy = signal<ToyModel | null>(null);
  protected cart_form: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private builder: FormBuilder,
    private utils: Utils,
  ) {
    this.route.params.subscribe((p) => {
      if (p['path']) {
        ToyService.getToyByPermalink(p['path']).then((rsp) => this.toy.set(rsp.data));
      }
    });
    this.cart_form = this.builder.group({
      quantity: [1, Validators.required],
    });
  }

  protected onSubmit() {
    if (!this.cart_form.valid) {
      this.utils.showAlert('Invalid form data');
      return;
    }

    if (!this.toy()) {
      this.utils.showAlert('Toy hasnt been loaded');
      return;
    }
    UserService.createCartItem({
      item: this.toy()!,
      quantity: this.cart_form.value.quantity,
    });
    this.router.navigateByUrl('/cart');
  }
  // quantity button

  increment(): void {
    // Get the current value from the form
    const currentQuantity = this.cart_form.get('quantity')?.value || 1;

    // Update the form control with the new value
    this.cart_form.patchValue({
      quantity: currentQuantity + 1,
    });
  }

  decrement(): void {
    const currentQuantity = this.cart_form.get('quantity')?.value || 1;

    // Prevent the quantity from dropping below 1
    if (currentQuantity > 1) {
      this.cart_form.patchValue({
        quantity: currentQuantity - 1,
      });
    }
  }
}
