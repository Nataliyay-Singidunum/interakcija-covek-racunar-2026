import axios from 'axios';
import { MovieModel } from '../models/movie.model';

const client = axios.create({
  baseURL: 'https://movie.pequla.com/api',
  headers: {
    'Accept': 'application/json',
    'X-Name': 'ICR2026'
  }
});

export class MovieService {
  static async getMovies(search: string = '') {
    return client.get<MovieModel[]>(`/movie?search=${search}`);
  }

  static async getMovieByShortURL(shortURL: string) {
    return client.get<MovieModel>(`/movie/short/${shortURL}`);
  }
}
