import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * CountryService — Manages the active country code from the URL prefix.
 *
 * The CountryLayoutComponent sets the country code when the route parameter
 * changes. All other services and components can inject this service to
 * access the current country code for API requests, pricing, and localization.
 */
@Injectable({ providedIn: 'root' })
export class CountryService {
  private countryCodeSubject = new BehaviorSubject<string>(environment.defaultCountry);

  /** Observable of the current country code (e.g., 'eg', 'sa', 'ae') */
  readonly countryCode$: Observable<string> = this.countryCodeSubject.asObservable();

  /** Synchronous getter for the current country code */
  get countryCode(): string {
    return this.countryCodeSubject.value;
  }

  /**
   * Set the active country code. Called by CountryLayoutComponent
   * when the :countryCode route parameter changes.
   */
  setCountryCode(code: string): void {
    const normalized = code.toLowerCase();
    if (this.isSupported(normalized)) {
      this.countryCodeSubject.next(normalized);
    } else {
      this.countryCodeSubject.next(environment.defaultCountry);
    }
  }

  /** Check if a country code is in the supported list */
  isSupported(code: string): boolean {
    return environment.supportedCountries.includes(code.toLowerCase());
  }

  /** Get the list of all supported country codes */
  getSupportedCountries(): string[] {
    return [...environment.supportedCountries];
  }

  /**
   * Build a routerLink path with the current country prefix.
   * Usage: countryService.link('/home') → '/eg/home'
   */
  link(path: string): string {
    const cleanPath = path.startsWith('/') ? path : '/' + path;
    return '/' + this.countryCode + cleanPath;
  }
}
