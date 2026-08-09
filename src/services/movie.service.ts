import axios from 'axios';
import { MovieModel } from '../models/movie.model';
import { GenreModel } from '../models/genre.model';

const client = axios.create({
  baseURL: 'https://movie.pequla.com/api',
  headers: {
    'Accept': 'application/json',
    'X-Name': 'ICR2026'
  }
});

// Modified - termin 8 cas 2 pocetak
export class MovieService {
  static async getMovies(search: string = '', genre: number = 0) {
    return client.request<MovieModel[]>({
      url: "/movie",
      method: "GET",
      params: {
        "search": search,
        "genre": genre
      }
    })
  }

  static async getMovieByShortURL(shortURL: string) {
    return client.get<MovieModel>(`/movie/short/${shortURL}`);
  }

  static async getGenres(){
    return client.get<GenreModel[]>("/genre");
  }

}
