import { Service } from '@angular/core';
import { ReviewModel } from '../models/review.model';
import { v4 as uuidv4 } from 'uuid';

@Service()
export class ReviewService {
  private static REVIEWS_KEY = 'icr_reviews';

  static getAllReviews(): ReviewModel[] {
    if (!localStorage.getItem(this.REVIEWS_KEY)) {
      const mockReviews: ReviewModel[] = [
        {
          reviewId: uuidv4(),
          toyId: 1,
          userEmail: 'user@example.com',
          username: 'Example User',
          reviewTitle: 'Kid loved it!!',
          rating: 5,
          reviewText:
            'My kid absolutely loves this puzzle. The wood quality is great and the animal shapes are very cute.',
          date: new Date('2026-08-19T10:00:00'),
        },
        {
          reviewId: uuidv4(),
          toyId: 1,
          userEmail: 'mark@example.com',
          username: 'Mark Z.',
          reviewTitle: 'Fine',
          rating: 4,
          reviewText:
            'It is a nice toy, but the pieces are slightly smaller than I expected. Still a good purchase.',
          date: new Date('2026-08-20T14:30:00'),
        },
        {
          reviewId: uuidv4(),
          toyId: 2,
          userEmail: 'alice@example.com',
          username: 'Alice Wonderland',
          reviewTitle: 'Hours of fun!',
          rating: 5,
          reviewText: 'My daughter plays with this for hours. Really happy with this purchase.',
          date: new Date('2026-08-18T11:20:00'),
        },
        {
          reviewId: uuidv4(),
          toyId: 2,
          userEmail: 'bob.builder@example.com',
          username: 'Bob B.',
          reviewTitle: 'Okay, but fragile',
          rating: 3,
          reviewText:
            'It is a decent toy for the price, but feels a bit fragile in the hands of a toddler.',
          date: new Date('2026-08-19T09:15:00'),
        },
        {
          reviewId: uuidv4(),
          toyId: 4,
          userEmail: 'coolaunt@example.com',
          username: 'Sarah J.',
          reviewTitle: 'Perfect birthday gift',
          rating: 5,
          reviewText: 'Bought this for my nephew and he absolutely adores it. Highly recommend!',
          date: new Date('2026-08-15T14:45:00'),
        },
        {
          reviewId: uuidv4(),
          toyId: 5,
          userEmail: 'angrydad@example.com',
          username: 'Tom H.',
          reviewTitle: 'Broke immediately',
          rating: 1,
          reviewText: 'Very disappointed. A piece snapped off after just two days of normal play.',
          date: new Date('2026-08-16T18:30:00'),
        },
        {
          reviewId: uuidv4(),
          toyId: 5,
          userEmail: 'user99@example.com',
          username: 'Anonymous',
          reviewTitle: 'Not bad',
          rating: 4,
          reviewText: 'Gets the job done, the kids like the bright colors.',
          date: new Date('2026-08-17T10:10:00'),
        },
        {
          reviewId: uuidv4(),
          toyId: 5,
          userEmail: 'karen@example.com',
          username: 'Karen Smith',
          reviewTitle: 'Decent toy',
          rating: 3,
          reviewText: 'It is alright. Nothing special, but it matched the description.',
          date: new Date('2026-08-18T16:05:00'),
        },
        {
          reviewId: uuidv4(),
          toyId: 6,
          userEmail: 'teacher.dan@example.com',
          username: 'Dan',
          reviewTitle: 'Very educational',
          rating: 5,
          reviewText:
            'As a teacher, I love toys that promote cognitive development. This does exactly that.',
          date: new Date('2026-08-14T08:20:00'),
        },
        {
          reviewId: uuidv4(),
          toyId: 6,
          userEmail: 'momof3@example.com',
          username: 'SuperMom',
          reviewTitle: 'Good value',
          rating: 4,
          reviewText: 'Worth the money. Keeps the kids occupied so I can drink my coffee in peace.',
          date: new Date('2026-08-19T07:45:00'),
        },
        {
          reviewId: uuidv4(),
          toyId: 7,
          userEmail: 'gamenight@example.com',
          username: 'BoardGameGeek',
          reviewTitle: 'A timeless classic!',
          rating: 5,
          reviewText:
            'You cannot go wrong with Monopoly. An absolute staple for family game nights.',
          date: new Date('2026-08-10T19:00:00'),
        },
        {
          reviewId: uuidv4(),
          toyId: 7,
          userEmail: 'siblingrivalry@example.com',
          username: 'CompetitiveBro',
          reviewTitle: 'Ruins friendships (in a good way)',
          rating: 5,
          reviewText: '10/10 would bankrupt my sister and buy boardwalk again.',
          date: new Date('2026-08-12T21:30:00'),
        },
        {
          reviewId: uuidv4(),
          toyId: 7,
          userEmail: 'impatient@example.com',
          username: 'BusyMom',
          reviewTitle: 'Takes too long',
          rating: 3,
          reviewText:
            'The game takes way too long to finish. The younger kids lose focus after an hour.',
          date: new Date('2026-08-15T15:15:00'),
        },
        {
          reviewId: uuidv4(),
          toyId: 7,
          userEmail: 'unlucky@example.com',
          username: 'MissingPieces',
          reviewTitle: 'Where is the top hat?!',
          rating: 2,
          reviewText:
            'The game is fine, but our box arrived missing the top hat token. Unacceptable.',
          date: new Date('2026-08-18T12:00:00'),
        },
        {
          reviewId: uuidv4(),
          toyId: 7,
          userEmail: 'qualitychecker@example.com',
          username: 'QC_Expert',
          reviewTitle: 'Great board quality',
          rating: 4,
          reviewText:
            'The cardboard is thick and the cards are durable. Minus one star because the money tears easily.',
          date: new Date('2026-08-20T10:45:00'),
        },
        {
          reviewId: uuidv4(),
          toyId: 9,
          userEmail: 'snuggle@example.com',
          username: 'CozyFan',
          reviewTitle: 'Super soft material',
          rating: 5,
          reviewText: 'The plush material is amazing. My son sleeps with it every single night.',
          date: new Date('2026-08-17T20:20:00'),
        },
        {
          reviewId: uuidv4(),
          toyId: 10,
          userEmail: 'tiredears@example.com',
          username: 'HeadacheHaver',
          reviewTitle: 'Way too loud!',
          rating: 2,
          reviewText: 'There is no volume control on this thing. It drives me absolutely crazy.',
          date: new Date('2026-08-16T13:10:00'),
        },
        {
          reviewId: uuidv4(),
          toyId: 10,
          userEmail: 'happykid@example.com',
          username: 'CoolUncle',
          reviewTitle: 'Loud but fun',
          rating: 4,
          reviewText:
            'Yes, it is loud, but the kids think it is the greatest thing ever. Good purchase.',
          date: new Date('2026-08-20T17:50:00'),
        },
      ];
      localStorage.setItem(this.REVIEWS_KEY, JSON.stringify(mockReviews));
    }

// TEST
    const rawData = JSON.parse(localStorage.getItem(this.REVIEWS_KEY)!);
    return rawData.map((review: any) => ({
      ...review,
      date: new Date(review.date),
    }))

  }

  static getReviewsForToy(toyId: number): ReviewModel[] {
    const allReviews = this.getAllReviews();
    return allReviews.filter((review) => review.toyId === toyId);
  }

  static addReview(newReview: ReviewModel): void {
    const allReviews = this.getAllReviews();
    newReview.reviewId = uuidv4();
    allReviews.push(newReview);
    localStorage.setItem(this.REVIEWS_KEY, JSON.stringify(allReviews));
  }
}
