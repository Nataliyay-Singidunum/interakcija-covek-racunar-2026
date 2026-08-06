import axios from 'axios';
import { MovieModel } from '../models/movie.model';

export class MovieService {
  static async getMovies() {
    return  axios.get<MovieModel[]>('https://movie.pequla.com/api/movie');
  }
}
