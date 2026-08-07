import { Component, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { MovieModel } from '../../models/movie.model';

@Component({
  selector: 'app-movie',
  imports: [RouterLink],
  templateUrl: './movie.html',
  styleUrl: './movie.css',
})
export class Movie {
  protected movie = signal<MovieModel | null>(null);

  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe((p) => {
      if (p['path']) {
        //this.path.set(p["path"]);
        MovieService.getMovieByShortURL(p['path']).then((rsp) => this.movie.set(rsp.data));
      }
    });
  }
}
