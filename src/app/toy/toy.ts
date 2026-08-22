import { Component, signal, computed } from '@angular/core';
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
import { DecimalPipe, DatePipe } from '@angular/common';
import { ReviewModel } from '../../models/review.model';
import { ReviewService } from '../../services/review.service';

@Component({
  selector: 'app-toy',
  imports: [RouterLink, FormsModule, ReactiveFormsModule, DecimalPipe, DatePipe],
  templateUrl: './toy.html',
  styleUrl: './toy.css',
})
export class Toy {
  protected toy = signal<ToyModel | null>(null);
  protected reviews = signal<ReviewModel[]>([]);
  protected starArray = [1, 2, 3, 4, 5];
  protected cart_form: FormGroup;
  protected review_form: FormGroup;
  protected selectedRating: number = 0;
  protected canReview: boolean = false;
  protected hoveredRating: number = 0;

  protected averageRating = computed(() => {
    const reviews = this.reviews();
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return sum / reviews.length;
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private builder: FormBuilder,
    private utils: Utils,
  ) {
    this.route.params.subscribe((p) => {
      if (p['path']) {
        ToyService.getToyByPermalink(p['path']).then((rsp) => {
          this.toy.set(rsp.data);
          const toyId = rsp.data.toyId;
          this.reviews.set(ReviewService.getReviewsForToy(toyId));
          this.verifyPurchaseHistory(toyId);
        });
      }
    });
    this.cart_form = this.builder.group({
      quantity: [1, Validators.required],
    });

    this.review_form = this.builder.group({
      reviewTitle: ['', Validators.required],
      reviewText: ['', Validators.required],
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
      status: 'na',
    });
    this.router.navigateByUrl('/cart');
  }

  increment(): void {
    const currentQuantity = this.cart_form.get('quantity')?.value || 1;
    this.cart_form.patchValue({
      quantity: currentQuantity + 1,
    });
  }

  decrement(): void {
    const currentQuantity = this.cart_form.get('quantity')?.value || 1;
    if (currentQuantity > 1) {
      this.cart_form.patchValue({
        quantity: currentQuantity - 1,
      });
    }
  }

  setRating(rating: number) {
    this.selectedRating = rating;
  }

  onStarHover(rating: number) {
    this.hoveredRating = rating;
  }

  onStarLeave() {
    this.hoveredRating = 0;
  }

  onReviewSubmit() {
    const user = UserService.getActiveUser();

    if (!user) {
      this.utils.showAlert('You must be logged in to leave a review.');
      return;
    }
    if (this.selectedRating === 0) {
      this.utils.showAlert('Please select a star rating.');
      return;
    }
    if (!this.review_form.valid) {
      this.utils.showAlert('Please fill in both the title and review text.');
      return;
    }

    const newReview: ReviewModel = {
      reviewId: uuidv4(),
      toyId: this.toy()!.toyId, // Use the correct ID property from your ToyModel
      userEmail: user.email,
      username: `${user.firstName} ${user.lastName}`,
      reviewTitle: this.review_form.value.reviewTitle,
      reviewText: this.review_form.value.reviewText,
      rating: this.selectedRating,
      date: new Date(),
    };
    ReviewService.addReview(newReview);

    this.reviews.set([...this.reviews(), newReview]);
    this.review_form.reset();
    this.selectedRating = 0;

    this.utils.showAlert('Review submitted successfully!');
  }

  verifyPurchaseHistory(toyId: number) {
    const user = UserService.getActiveUser();

    if (!user || !user.data) {
      this.canReview = false;
      return;
    }

    this.canReview = user.data.some((order: any) => {
      if (order.items.status !== 'active') {
        return order.items.cartItems.some((cartItem: any) => cartItem.item.toyId == toyId);
      }
      return false;
    });
  }
}
