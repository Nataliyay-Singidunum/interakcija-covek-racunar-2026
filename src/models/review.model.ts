export interface ReviewModel {
  reviewId: string;
  toyId: number;
  userEmail: string;
  username: string;
  reviewTitle: string;
  rating: number;
  reviewText: string;
  date: Date;
}
