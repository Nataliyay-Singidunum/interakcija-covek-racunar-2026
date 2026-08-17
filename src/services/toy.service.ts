import axios from 'axios';
import { ToyModel } from '../models/toy.model';
import { MovieModel } from '../models/movie.model';

const client = axios.create({
  baseURL: 'https://toy.pequla.com/api',
  headers: {
    Accept: 'application/json',
    'X-Name': 'ICR2026',
  },
});

// Modified - termin 8 cas 2 pocetak
export class ToyService {
  static async getToys(search: string = '', genre: number = 0) {
    return client.request<ToyModel[]>({
      url: '/toy',
      method: 'GET',
      params: {
        search: search,
        genre: genre,
      },
    });
  }

  static async getToyByPermalink(permalink: string) {
    return client.get<ToyModel>(`/toy/permalink/${permalink}`);
  }

  static async getToyTypes() {
    return client.get<ToyModel[]>('/toy/type');
  }

  static async getToyAgeGroups() {
    return client.get<ToyModel[]>('/toy/age-group');
  }
}
