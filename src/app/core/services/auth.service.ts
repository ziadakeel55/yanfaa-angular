import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/user.model';

/**
 * AuthService — Centralized authentication state management.
 *
 * Exposes reactive observables (isLoggedIn$, currentUser$) that the Header,
 * mobile nav, and any guarded component can subscribe to via the async pipe.
 *
 * Usage in templates:
 *   *ngIf="authService.isLoggedIn$ | async"
 *   *ngIf="!(authService.isLoggedIn$ | async)"
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'yanfaa_token';
  private readonly USER_KEY = 'yanfaa_user';

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasStoredToken());
  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());

  /** Observable stream of login state — true when a valid session exists */
  readonly isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();

  /** Observable stream of the currently authenticated user (null when guest) */
  readonly currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  // ─── Synchronous getters ────────────────────────────────────────

  get isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  // ─── Auth Actions ───────────────────────────────────────────────

  /**
   * Log in with email and password.
   * Currently uses a mock implementation. Replace the `of(...)` with
   * `this.http.post<AuthResponse>(...)` when the backend is ready.
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    let isSubscribed = false;
    let subscriptionPlan = undefined;
    let subscriptionExpiresAt = undefined;

    // Check specific mock accounts
    if (credentials.email === '1' && credentials.password === '1') {
      isSubscribed = true;
      subscriptionPlan = 'lifetime'; // مدى الحياة
      subscriptionExpiresAt = '';
    } else if (credentials.email !== '0' || credentials.password !== '0') {
      isSubscribed = true;
      subscriptionPlan = 'annual';
      subscriptionExpiresAt = '١ سبتمبر ٢٠٢٦'; // Can be edited here
    }

    const mockResponse: AuthResponse = {
      user: {
        id: 'usr_' + Date.now(),
        firstName: credentials.email === '0' ? 'مستخدم' : (credentials.email === '1' ? 'مشترك' : 'أحمد'),
        lastName: credentials.email === '0' ? 'عادي' : (credentials.email === '1' ? 'مميز' : 'محمد'),
        email: credentials.email,
        isSubscribed: isSubscribed,
        subscriptionPlan: subscriptionPlan,
        subscriptionExpiresAt: subscriptionExpiresAt,
      },
      token: 'mock_jwt_token_' + Date.now(),
    };

    return of(mockResponse).pipe(
      delay(800),
      tap((response) => this.handleAuthSuccess(response))
    );
  }

  /**
   * Register a new user account.
   * Mock implementation — replace with real API call.
   */
  register(data: RegisterRequest): Observable<AuthResponse> {
    const mockResponse: AuthResponse = {
      user: {
        id: 'usr_' + Math.random().toString(36).substring(2, 8),
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        isSubscribed: false,
      },
      token: 'mock_jwt_token_' + Date.now(),
    };

    return of(mockResponse).pipe(
      delay(800),
      tap((response) => this.handleAuthSuccess(response))
    );
  }

  /**
   * Log out the current user, clearing all stored state.
   */
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.isLoggedInSubject.next(false);
    this.currentUserSubject.next(null);
  }

  /**
   * Request a password reset email.
   * Mock implementation — replace with real API call.
   */
  requestPasswordReset(email: string): Observable<{ message: string }> {
    return of({ message: 'تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني' }).pipe(
      delay(600)
    );
  }

  // ─── Private Helpers ────────────────────────────────────────────

  private handleAuthSuccess(response: AuthResponse): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, response.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    }
    this.isLoggedInSubject.next(true);
    this.currentUserSubject.next(response.user);
  }

  private hasStoredToken(): boolean {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem(this.TOKEN_KEY);
    }
    return false;
  }

  private getStoredUser(): User | null {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.USER_KEY);
      if (stored) {
        try {
          return JSON.parse(stored) as User;
        } catch {
          return null;
        }
      }
    }
    return null;
  }
}
