import { Component, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { CountryService } from '../../../core/services/country.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Input() hideOffer = false;
  isMobileMenuOpen = false;
  searchQuery = '';

  offer: { enabled: boolean; text: string; buttonText: string; buttonLink: string } = {
    enabled: false,
    text: '',
    buttonText: 'احصل على الخصم',
    buttonLink: '/subscribe'
  };

  private authService = inject(AuthService);
  public countryService = inject(CountryService);
  public router = inject(Router);
  private http = inject(HttpClient);

  currentUser$ = this.authService.currentUser$;

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.searchQuery = '';
    });

    this.http.get<any>('/assets/data/config.json').subscribe({
      next: (config) => {
        console.log('Fetched config:', config);
        if (config?.offer) {
          this.offer = config.offer;
          console.log('Set offer to:', this.offer);
        }
      },
      error: () => {
        // config.json not found or error — keep defaults
      }
    });
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  logout(): void {
    this.authService.logout();
    this.isMobileMenuOpen = false;
    this.router.navigate([this.countryService.link('/login')]);
  }

  onSearch(event: Event): void {
    event.preventDefault();
    if (this.searchQuery.trim()) {
      this.router.navigate([this.countryService.link('/search')], {
        queryParams: { q: this.searchQuery }
      });
    }
  }

  getLink(path: string): string {
    return this.countryService.link(path);
  }
}
