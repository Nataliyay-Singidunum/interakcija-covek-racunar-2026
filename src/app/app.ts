import { Component, signal, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UserService } from '../services/user.service';
import { Utils } from './utils';
import { MessageModel } from '../models/message.model';
import { RasaService } from '../services/rasa.service';
import { FormsModule } from '@angular/forms';
import { MovieService } from '../services/movie.service';
import { Movie } from './movie/movie';
import { MovieModel } from '../models/movie.model';
import { AxiosResponse } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { ToyModel } from '../models/toy.model';
import { DecimalPipe } from '@angular/common';
import { ReviewService } from '../services/review.service';
import { ToyService } from '../services/toy.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  providers: [DecimalPipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('interakcija-covek-racunar-2025');
  protected year = new Date().getFullYear();
  protected waitingForResponse: boolean = false;
  protected botThinkingPlaceholder: string = 'Thinking...';
  protected isChatVisible: boolean = false;
  protected userMessage: string = '';
  protected messages: MessageModel[] = [];
  protected order_movie = signal<MovieModel | null>(null);

  constructor(
    private router: Router,
    private utils: Utils,
    private decimalPipe: DecimalPipe,
    private cdr: ChangeDetectorRef        // baca update kad stigne poruka da ne mora da se ukliktava
  ) {
    this.messages.push({
      type: 'bot',
      text: 'Hiiii! How can I help? :) ',
    });
  }

  toggleChat() {
    this.isChatVisible = !this.isChatVisible;
  }

  protected getAverageRating(toyId: number): number {
    const revs = ReviewService.getReviewsForToy(toyId);
    if (revs.length === 0) return 0;

    const sum = revs.reduce((total, review) => total + review.rating, 0);
    return sum / revs.length;
  }

  async sendUserMessage() {
    if (this.waitingForResponse) {
      return;
    }

    const trimmedMessage = this.userMessage.trim();
    this.userMessage = '';

    this.messages.push({
      type: 'user',
      text: trimmedMessage,
    });

    this.messages.push({
      type: 'bot',
      text: this.botThinkingPlaceholder,
    });

    RasaService.sendMessage(trimmedMessage)
      .then((rsp) => {
        if (rsp.data.length == 0) {
          this.messages.push({
            type: 'bot',
            text: "Sorry I didn't understand your question. Please try again.",
          });
          localStorage.setItem('icr_sender_id', uuidv4()); // posle 3 dana konacno fix za multiple orders in one session
          this.removeBotPlaceholder();
          return;
        }

        for (let message of rsp.data) {
          if (message.attachment != null) {
            if (message.attachment.type == 'toy_list' && Array.isArray(message.attachment.data)) {
              let html = '';
              for (let toy of message.attachment.data as ToyModel[]) {
                html += '<ul class="list-unstyled mb-3">';
                html += `<li class="d-flex align-items-baseline justify-content-between mb-0">
                          <h6 class="mb-0">${toy.name}</h6>
                          <p class="mb-0 pink-subtle">
                          ${this.decimalPipe.transform(this.getAverageRating(toy.toyId), '1.2-2')}
                          <i class="fa-solid fa-star"></i></p></li>`;
                html += `<li class="text-secondary mb-1">${toy.productionDate}</li>`;
                html += `<li> ${toy.description}</li>`;

                html += '<li class="mt-1">';
                html += `<p class="badge rounded-pill bg-secondary p-2 mb-0">${toy.ageGroup.name} </p>`;
                if (toy.targetGroup == 'dečak') {
                  html +=
                    '<p  class="badge rounded-pill bg-primary-subtle p-2 mx-2 mb-1 text-primary" >dečaci</p>';
                } else if (toy.targetGroup == 'devojčica') {
                  html += `<p  class="badge rounded-pill p-2 mx-2 color-pink mb-1" >devojčice</p>`;
                } else {
                  html += `<p  class="badge rounded-pill bg-secondary-subtle p-2 mx-2 mb-1 text-secondary"> ${toy.targetGroup}</p>`;
                }
                html += `<p class="badge rounded-pill bg-secondary p-2 mb-0">${toy.type.name} </p>`;
                html += '</li>';
                html += `<li><img style="max-width: 50px;" src="https://raw.githubusercontent.com/Pequla/express-toys-api/refs/heads/main/src/public${toy.imageUrl}" class="card-img-top mb-1 rounded-1" [alt]="toy.name"></li>`;
                html += `<li><b>Cena: ${this.decimalPipe.transform(toy.price, '1.2-2')} RSD</b></li>`;
                html += '</hr>';
                html += `<li><a href="/toy/${toy.permalink}">More details...</a></li>`;
                html += `<li class="my-3"><hr></li>`;
                html += `</ul>`;
              }
              this.messages.push({
                type: 'bot',
                text: html,
              });
            }

            if (message.attachment.type == 'toy') {
              let html = '';
              let toy = message.attachment.data;

              html += '<ul class="list-unstyled mb-3">';
              html += `<li class="d-flex align-items-baseline justify-content-between mb-0">
                        <h6 class="mb-0">${toy.name}</h6>
                        <p class="mb-0 pink-subtle">
                        ${this.decimalPipe.transform(this.getAverageRating(toy.toyId), '1.2-2')}
                        <i class="fa-solid fa-star"></i></p></li>`;
              html += `<li class="text-secondary mb-1">${toy.productionDate}</li>`;
              html += `<li> ${toy.description}</li>`;

              html += '<li class="mt-1">';
              html += `<p class="badge rounded-pill bg-secondary p-2 mb-0">${toy.ageGroup.name} </p>`;
              if (toy.targetGroup == 'dečak') {
                html +=
                  '<p  class="badge rounded-pill bg-primary-subtle p-2 mx-2 mb-1 text-primary" >dečaci</p>';
              } else if (toy.targetGroup == 'devojčica') {
                html += `<p  class="badge rounded-pill p-2 mx-2 color-pink mb-1" >devojčice</p>`;
              } else {
                html += `<p  class="badge rounded-pill bg-secondary-subtle p-2 mx-2 mb-1 text-secondary"> ${toy.targetGroup}</p>`;
              }
              html += `<p class="badge rounded-pill bg-secondary p-2 mb-0">${toy.type.name} </p>`;
              html += '</li>';
              html += `<li><img style="max-width: 50px;" src="https://raw.githubusercontent.com/Pequla/express-toys-api/refs/heads/main/src/public${toy.imageUrl}" class="card-img-top mb-1 rounded-1" [alt]="toy.name"></li>`;
              html += `<li><b>Cena: ${this.decimalPipe.transform(toy.price, '1.2-2')} RSD</b></li>`;
              html += '</hr>';
              html += `<li><a href="/toy/${toy.permalink}">More details...</a></li>`;
              html += `<li class="my-3"><hr></li>`;
              html += `</ul>`;

              this.messages.push({
                type: 'bot',
                text: html,
              });
            }


            if (message.attachment.type == 'toy_rating_list' && message.attachment.data) {
              const criteriaString = String(message.attachment.data).replace(/[^0-9.]/g, '');
              const minRating = parseFloat(criteriaString) || 0;

              ToyService.getToys().then((rsp) => {
                const allToys = rsp.data;
                let toys = allToys.filter((toy: ToyModel) => {
                  return this.getAverageRating(toy.toyId) >= minRating;
                });

                let html = '';
                for (let toy of toys as ToyModel[]) {
                  html += '<ul class="list-unstyled mb-3">';
                  html += `<li class="d-flex align-items-baseline justify-content-between mb-0">
                          <h6 class="mb-0">${toy.name}</h6>
                          <p class="mb-0 pink-subtle">
                          ${this.decimalPipe.transform(this.getAverageRating(toy.toyId), '1.2-2')}
                          <i class="fa-solid fa-star"></i></p></li>`;
                  html += `<li class="text-secondary mb-1">${toy.productionDate}</li>`;
                  html += `<li> ${toy.description}</li>`;

                  html += '<li class="mt-1">';
                  html += `<p class="badge rounded-pill bg-secondary p-2 mb-0">${toy.ageGroup.name} </p>`;
                  if (toy.targetGroup == 'dečak') {
                    html +=
                      '<p  class="badge rounded-pill bg-primary-subtle p-2 mx-2 mb-1 text-primary" >dečaci</p>';
                  } else if (toy.targetGroup == 'devojčica') {
                    html += `<p  class="badge rounded-pill p-2 mx-2 color-pink mb-1" >devojčice</p>`;
                  } else {
                    html += `<p  class="badge rounded-pill bg-secondary-subtle p-2 mx-2 mb-1 text-secondary"> ${toy.targetGroup}</p>`;
                  }
                  html += `<p class="badge rounded-pill bg-secondary p-2 mb-0">${toy.type.name} </p>`;
                  html += '</li>';
                  html += `<li><img style="max-width: 50px;" src="https://raw.githubusercontent.com/Pequla/express-toys-api/refs/heads/main/src/public${toy.imageUrl}" class="card-img-top mb-1 rounded-1" [alt]="toy.name"></li>`;
                  html += `<li><b>Cena: ${this.decimalPipe.transform(toy.price, '1.2-2')} RSD</b></li>`;
                  html += '</hr>';
                  html += `<li><a href="/toy/${toy.permalink}">More details...</a></li>`;
                  html += `<li class="my-3"><hr></li>`;
                  html += `</ul>`;
                }
                this.messages.push({
                  type: 'bot',
                  text: html,
                });

                this.cdr.detectChanges();
              });
            }

            // Returns movie list                             MOVIES START HERE
            if (message.attachment.type == 'movie_list' && Array.isArray(message.attachment.data)) {
              let html = '';
              for (let movie of message.attachment.data as MovieModel[]) {
                html += '<ul class="list-unstyled">';
                html += `<li> Title: ${movie.title}</li>`;
                html += `<li> Director: ${movie.director.name}</li>`;
                html += `<li> Genre: ${movie.movieGenres.map((mg) => mg.genre.name)}</li>`;
                html += `<li> Actors: ${movie.movieActors.map((ma) => ma.actor.name)}</li>`;
                html += `</ul>`;
                html += `<p>${movie.description}</p>`;
              }
              this.messages.push({
                type: 'bot',
                text: html,
              });
            }

            // Simple object lists
            if (
              message.attachment.type == 'genre_list' ||
              message.attachment.type == 'actor_list' ||
              message.attachment.type == 'director_list'
            ) {
              let html = '<ul class="list-unstyled">';

              const MAX_ITEMS = 50;
              const itemsToDisplay = message.attachment.data.slice(0, MAX_ITEMS);

              for (let obj of itemsToDisplay) {
                html += `<li>${obj.name}</li>`;
              }

              if (message.attachment.data.length > MAX_ITEMS) {
                const remaining = message.attachment.data.length - MAX_ITEMS;
                html += `</br><li><em>...and ${remaining} more unlisted.</em></li>`;
              }

              html += `</ul>`;
              this.messages.push({
                type: 'bot',
                text: html,
              });
            }

            // Simple list (array)
            if (message.attachment.type == 'simple_list') {
              let html = `<ul class='list-unstyled'>`;
              for (let obj of message.attachment.data) {
                html += `<li>${obj}</li>`;
              }
              html += `</ul>`;
              this.messages.push({
                type: 'bot',
                text: html,
              });
            }

            // Place order
            if (message.attachment.type == 'create_order') {
              const obj = message.attachment.data;

              let html = `<ul class='list-unstyled'>`;
              html += `<li>Movie: ${obj.movie}</li>`;
              html += `<li>Cinema: ${obj.cinema}</li>`;
              html += `<li>Hall: ${obj.hall}</li>`;
              html += `<li>Time: ${obj.time}</li>`;
              html += `<li>Count: ${obj.count}</li>`;
              html += `</ul>`;

              MovieService.getMovieByShortURL(obj.movie)

                .then((response) => {
                  const order_movie = response.data;
                  console.log('Movie fetched successfully:', order_movie);

                  /* UserService.createReservation({
                  movieId: order_movie.movieId,
                  movieTitle: order_movie.title,
                  cinema: obj.cinema,
                  hall: obj.hall,
                  quantity: obj.count,
                  status: 'na',
                  time: obj.time,
                  orderId: uuidv4(),
                });*/
                })
                .catch((err) => {
                  console.error('Failed to fetch movie details:', err);
                });

              this.messages.push({
                type: 'bot',
                text: html,
              });
            }

            // Make an order  -- za sada ne salje nigde treba popravityi korisceno je u testing fazi, dodati sada u extract movie
            if (message.attachment.type == 'order_movie') {
              this.router.navigateByUrl(
                `/movie/${(message.attachment.data as MovieModel).shortUrl}/reservation`,
              );
            }
          }
          this.messages.push({
            type: 'bot',
            text: message.text,
          });
        }

        this.messages = this.messages.filter((m) => {
          if (m.type === 'bot') {
            return m.text != this.botThinkingPlaceholder;
          }
          return true;
        });
        this.cdr.detectChanges();
      })
      .catch(() => {
        this.removeBotPlaceholder();
        this.messages.push({
          type: 'error',
          text: 'Sorry, something went wrong. Please try again.',
        });
      });
  }

  async createBotResponseAsMovieList(genre: number = 0) {
    const movies = await MovieService.getMovies('', genre);

    let html = '<ul class="list-unstyled">';
    movies.data
      .map((m) => `<li><a href="/movie/${m.shortUrl}">${m.title} (${m.director.name})</a></li>`)
      .forEach((m) => (html += m));
    html += '</ul>';

    this.messages.push({
      type: 'bot',
      text: html,
    });
    this.removeBotPlaceholder();
  }

  removeBotPlaceholder() {
    this.messages = this.messages.filter((m) => {
      if (m.type === 'bot') {
        return m.text != this.botThinkingPlaceholder;
      }
      return true;
    });
  }

  getUserName() {
    const user = UserService.getActiveUser();
    return `${user.firstName} ${user.lastName}`;
  }

  hasAuth() {
    return UserService.hasAuth();
  }

  doLogout() {
    this.utils.showDialog(
      'Are you sure you want to logout?',
      () => {
        UserService.logout();
        this.router.navigate(['/login']);
      },
      'Logout',
      'Cancel',
    );
  }
}
