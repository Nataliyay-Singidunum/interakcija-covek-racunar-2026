import { Component, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-movie',
  imports: [],
  templateUrl: './movie.html',
  styleUrl: './movie.css',
})
export class Movie {
  protected path = signal<string>("")

  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe(p => {
      if (p["path"]){
        this.path.set(p["path"]);
      }
    })
  }
}
