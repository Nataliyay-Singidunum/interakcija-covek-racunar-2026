import { Component, signal } from '@angular/core';
import { MovieModel } from '../../models/movie.model';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { UserService } from '../../services/user.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Utils } from '../utils';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-reservation',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './reservation.html',
  styleUrl: './reservation.css',
})
export class Reservation {
  protected movie = signal<MovieModel | null>(null);
  protected form: FormGroup;

  constructor( private route: ActivatedRoute, private router: Router, private builder: FormBuilder, private utils: Utils) {
    this.route.params.subscribe((p) => {
      if (p['path']) {
        const shortUrl = p['path'];
        if (!UserService.hasAuth()) {
          localStorage.setItem(UserService.TO_KEY, '/movie/${shortUrl}/reservation');
          this.router.navigateByUrl('/login');
          return;
        }
        MovieService.getMovieByShortURL(p['path']).then((rsp) => this.movie.set(rsp.data));

      }
    });
    this.form = this.builder.group({
      time: ['Monday 22h', Validators.required],
      cinema: ['Usce', Validators.required],
      hall: ['Big', Validators.required],
      quantity: ['1', Validators.required],
    });
  }

  protected  onSubmit() {
    if (!this.form.valid) {
      this.utils.showAlert('Invalid form data');
      return;
    }

    if (!this.movie()) {
      this.utils.showAlert('Movie hasnt been loaded');
      return;
    }

    //@ts-ignore
    UserService.createReservation({
      //@ts-ignore
      movieId: this.movie()!.movieId,
      movieTitle: this.movie()!.title,
      cinema: this.form.value.cinema,
      hall: this.form.value.hall,
      quantity: this.form.value.quantity,
      status: 'na',
      time: this.form.value.time,
      orderId: uuidv4(),
    });

    this.router.navigateByUrl('/profile');

  }
}
