import { Component, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ToyModel } from '../../models/toy.model';
import { ToyService } from '../../services/toy.service';

@Component({
  selector: 'app-toy',
  imports: [RouterLink],
  templateUrl: './toy.html',
  styleUrl: './toy.css',
})
export class Toy {
  protected toy = signal<ToyModel | null>(null);

  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe((p) => {
      if (p['path']) {
        //this.path.set(p["path"]);
        ToyService.getToyByPermalink(p['path']).then((rsp) => this.toy.set(rsp.data));
      }
    });
  }
}
