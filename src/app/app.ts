import { Component, signal } from '@angular/core';
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

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
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

  constructor(
    private router: Router,
    private utils: Utils,
  ) {
    this.messages.push({
      type: 'bot',
      text: 'How can I help you?',
    });
  }

  toggleChat() {
    this.isChatVisible = !this.isChatVisible;
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

    RasaService.sendMessage(trimmedMessage).then((rsp) => {
      if (rsp.data.length == 0) {
        this.messages.push({
          type: 'bot',
          text: "Sorry I didn't understand your question. Please try again.",
        });
        return;
      }

      for(let message of rsp.data) {
        if (message.attachment != null){
          // Returns movie list
          if (message.attachment.type == "movie_list" && Array.isArray(message.attachment.data)) {
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
          if (message.attachment.type == 'genre_list' || message.attachment.type == 'actor_list' || message.attachment.type == 'director_list') {
            let html = '<ul class="list-unstyled">';

            // Wont render all actors since there are more than 1800 entries
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
        }
        this.messages.push({
          type: 'bot',
          text: message.text
        });
      }

      this.messages = this.messages.filter( m=>{
        if(m.type === 'bot'){
          return m.text != this.botThinkingPlaceholder;
        }
        return true;
      });
    });

    // Lokalna verzija u jsu - Bez Rase - 8. termin - 30+ min

/*    if (trimmedMessage.includes('all movies')) {
      await this.createBotResponseAsMovieList();
      return;
    }

    if (trimmedMessage.endsWith('movie details')) {
      const query = trimmedMessage.split('movie details')[0].trim();

      const movies = await   MovieService.getMovies(query);
      if (movies.data.length > 0) {

        const movie = movies.data[0];
        let html = '<ul class="list-unstyled">';
        html += `<li> Title: ${movie.title}</li>`;
        html += `<li> Director: ${movie.director.name}</li>`;
        html += `<li> Genre: ${movie.movieGenres.map(mg => mg.genre.name)}</li>`;
        html += `<li> Actors: ${movie.movieActors.map((a) => a.actor.name)}</li>`;
        html += `</ul>`;
        html += `<p>${movie.description}</p>`

        this.messages.push({
          type: 'bot',
          text: html
        });

      } else {
        this.messages.push({
          type: 'bot',
          text: 'Movie not found :('
        });
      }

      this.removeBotPlaceholder();
      return;
    }

    const genres = await MovieService.getGenres();
    if (trimmedMessage.includes('genre list')) {
      let html = '<ul class="list-unstyled">';
      genres.data
        .map((g) => `<li>${g.name}</li>`)
        .forEach((g) => (html += g));
      html += '</ul>';

      this.messages.push({
        type: 'bot',
        text: html,
      });
      this.removeBotPlaceholder();
      return;
    }
    console.log(genres.data);
    for (let genre of genres.data) {

      if (trimmedMessage.includes('genre ' + genre.name.toLowerCase())) {
        await this.createBotResponseAsMovieList(genre.genreId);
        return
      }
    }
    this.removeBotPlaceholder();
    this.messages.push({
      type: 'bot',
      text: "Seems like i cant help you with that!"
    });*/
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
