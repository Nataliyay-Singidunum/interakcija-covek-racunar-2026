import { Routes } from '@angular/router';
import { Home } from './home/home';
import { About } from './about/about';
import { Login } from './login/login';
import { Signup } from './signup/signup';
import { Movie } from './movie/movie';
import { Profile } from './profile/profile';
import { Reservation } from './reservation/reservation';
import { Toy } from './toy/toy';
import { Contact } from './contact/contact';

export const routes: Routes = [
  { path: '', title: 'Home', component: Home },
  { path: 'about', title: 'About', component: About },
  { path: 'contact', title: 'Contact', component: Contact },
  { path: 'login', title: 'Login', component: Login },
  { path: 'signup', title: 'SignUp', component: Signup },
  { path: 'movie/:path/reservation', title: 'Movie Reservation', component: Reservation },
  { path: 'movie/:path', title: 'Movie', component: Movie },
  { path: 'toy/:path', title: 'Toy', component: Toy },
  { path: 'profile', title: 'Profile', component: Profile },
  { path: '**', title: 'Home', component: Home },
];
