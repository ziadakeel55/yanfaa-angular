import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CountryService } from '../../core/services/country.service';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

/**
 * CountryLayoutComponent — Wraps all country-prefixed routes.
 *
 * Captures the :countryCode route parameter, validates it, and injects
 * it into CountryService. All child routes render inside this component's
 * <router-outlet>.
 *
 * URL pattern: /:countryCode/home, /:countryCode/single/:slug, etc.
 */
@Component({
  selector: 'app-country-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './country-layout.component.html',
  styleUrls: ['./country-layout.component.css'],
})
export class CountryLayoutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private countryService: CountryService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const code = params['countryCode'];
      if (code && this.countryService.isSupported(code)) {
        this.countryService.setCountryCode(code);
      } else {
        // Invalid country code (which means it's likely a 404 path) → redirect to 404
        this.router.navigate(['/404']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
