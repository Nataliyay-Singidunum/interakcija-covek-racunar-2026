import { Component, signal } from '@angular/core';
import { MovieService } from '../../services/movie.service';
import { MovieModel } from '../../models/movie.model';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToyModel } from '../../models/toy.model';
import { ToyService } from '../../services/toy.service';
import { UserService } from '../../services/user.service';
import { ReviewService } from '../../services/review.service';
import { DecimalPipe } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  imports: [RouterLink, FormsModule, DecimalPipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  protected movies = signal<MovieModel[]>([]);
  protected toys = signal<ToyModel[]>([]);

  protected previousSearch: string = 'N/A';
  protected search = '';
  protected searchCriteria: string = '1';
  protected minPrice: number = 0;
  protected maxPrice: number = 10000;
  protected selectedPriceRange: string = '0-100000';
  uniqueTypes: string[] = [];
  selectedType: string = '';
  uniqueAgeGroups: string[] = [];
  selectedAgeGroup: string = '';
  uniqueTargetGroups: string[] = [];
  selectedTargetGroup: string = '';
  uniquePeriods: string[] = [];
  selectedPeriod: string = '';
  protected selectedRating: number = 0;

  constructor(private router: Router) {
    this.loadToys();
  }

  protected loadMovies() {
    if (this.previousSearch == '' && this.search == '') {
      return;
    }
    this.previousSearch = this.search;
    MovieService.getMovies(this.search).then((rsp) => this.movies.set(rsp.data));
    ToyService.getToys().then((rsp) => this.toys.set(rsp.data));
  }

  ngOnInit(): void {
    ToyService.getToys().then((rsp) => {
      this.toys.set(rsp.data);
      const allTypes = rsp.data.map((toy) => toy.type.name);
      this.uniqueTypes = [...new Set(allTypes)];
      const allAgeGroups = rsp.data.map((toy) => toy.ageGroup.name);
      this.uniqueAgeGroups = [...new Set(allAgeGroups)];
      const allTargetGroups = rsp.data.map((toy) => toy.targetGroup);
      this.uniqueTargetGroups = [...new Set(allTargetGroups)];
      const allPeriods = rsp.data.map((toy) => {
        const year = toy.productionDate.substring(0, 4);
        const month = parseInt(toy.productionDate.substring(5, 7), 10);
        return month <= 6 ? `${year} Half 1 (Jan-Jun)` : `${year} Half 2 (Jul-Dec)`;
      });
      this.uniquePeriods = [...new Set(allPeriods)].sort((a, b) => b.localeCompare(a));
    });
  }

  onPriceRangeChange(): void {
    const limits = this.selectedPriceRange.split('-');

    this.minPrice = Number(limits[0]);
    this.maxPrice = Number(limits[1]);

    this.loadToys();
  }

  protected loadToys() {
    if (
      this.previousSearch == '' &&
      this.search == '' &&
      this.searchCriteria !== '3' &&
      this.searchCriteria !== '4' &&
      this.searchCriteria !== '5' &&
      this.searchCriteria !== '6' &&
      this.searchCriteria !== '7' &&
      this.searchCriteria !== '8'
    ) {
      return;
    }
    this.previousSearch = this.search;

    ToyService.getToys().then((rsp) => {
      const searchTerm = this.search.toLowerCase();
      const filteredToys = rsp.data.filter((toy) => {
        if (
          !searchTerm &&
          this.searchCriteria !== '3' &&
          this.searchCriteria !== '4' &&
          this.searchCriteria !== '5' &&
          this.searchCriteria !== '6' &&
          this.searchCriteria !== '7' &&
          this.searchCriteria !== '8'
        ) {
          return true;
        }
        switch (this.searchCriteria) {
          case '1':
            return toy.name.toLowerCase().includes(searchTerm);
          case '2':
            return toy.description.toLowerCase().includes(searchTerm);
          case '3':
            if (!this.selectedType) return true;
            return toy.type.name === this.selectedType;
          case '4':
            if (!this.selectedAgeGroup) return true;
            return toy.ageGroup.name === this.selectedAgeGroup;
          case '5':
            if (!this.selectedTargetGroup) return true;
            return toy.targetGroup === this.selectedTargetGroup;
          case '6':
            if (!this.selectedPeriod) return true;
            const toyYear = toy.productionDate.substring(0, 4);
            const toyMonth = parseInt(toy.productionDate.substring(5, 7), 10);
            const toyPeriod =
              toyMonth <= 6 ? `${toyYear} Half 1 (Jan-Jun)` : `${toyYear} Half 2 (Jul-Dec)`;
            return toyPeriod === this.selectedPeriod;
          case '7':
            return toy.price >= this.minPrice && toy.price <= this.maxPrice;
          case '8':
            return this.getAverageRating(toy.toyId) >= this.selectedRating;
          default:
            return toy.name.toLowerCase().includes(searchTerm);
        }
      });

      if (this.searchCriteria === '8') {
        filteredToys.sort(
          (a, b) => this.getAverageRating(b.toyId) - this.getAverageRating(a.toyId),
        );
      }
      this.toys.set(filteredToys);
    });
  }

  protected getAverageRating(toyId: number): number {
    const revs = ReviewService.getReviewsForToy(toyId);
    if (revs.length === 0) return 0;

    const sum = revs.reduce((total, review) => total + review.rating, 0);
    return sum / revs.length;
  }

  protected addToCart(toy: ToyModel) {
    UserService.createCartItem({
      item: toy,
      quantity: 1,
      status: 'na',
    });
    Swal.fire({
      position: 'center',
      icon: 'success',
      title: 'Item Added to Cart',
      showConfirmButton: false,
      timer: 1500,
      backdrop: `
        rgba(0,0,123,0.4)
        url("/nyan.gif")
        top
        no-repeat
      `,
    });
  }

  protected readonly ReviewService = ReviewService;
}
