import { Component, signal } from '@angular/core';
import { MovieService } from '../../services/movie.service';
import { MovieModel } from '../../models/movie.model';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToyModel } from '../../models/toy.model';
import { ToyService } from '../../services/toy.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  protected movies = signal<MovieModel[]>([]);
  protected toys = signal<ToyModel[]>([]);

  protected previousSearch: string = 'N/A';
  protected search = '';

  constructor() {
    this.loadMovies();
  }

  protected loadMovies() {
    if (this.previousSearch == '' && this.search == '') {
      return;
    }
    this.previousSearch = this.search;
    MovieService.getMovies(this.search).then((rsp) => this.movies.set(rsp.data));
    ToyService.getToys().then((rsp) => this.toys.set(rsp.data));
  }
}
