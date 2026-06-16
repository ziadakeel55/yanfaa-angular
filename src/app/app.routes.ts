import { Routes } from '@angular/router';
import { environment } from '../environments/environment';
import { authGuard } from './core/guards/auth.guard';

/**
 * Yanfaa Angular — Application Routes
 *
 * Architecture: All user-facing routes are nested under a `:countryCode` prefix
 * (e.g., /eg/home, /sa/subscribe). The CountryLayoutComponent captures this
 * parameter and injects it into CountryService, so child components never need
 * to parse the URL themselves.
 *
 * Route structure mirrors the original site's sitemap:
 *   https://yanfaa.com/eg/home
 *   https://yanfaa.com/eg/single/:courseSlug
 *   https://yanfaa.com/eg/category/:categorySlug
 *   https://yanfaa.com/eg/subscribe
 *   https://yanfaa.com/eg/subscribe/:couponCode
 *   https://yanfaa.com/eg/learning-paths
 *   https://yanfaa.com/eg/learning-paths/:pathSlug
 */
export const routes: Routes = [
  // ─── Root redirect → default country home ───────────────────────
  {
    path: '',
    redirectTo: `${environment.defaultCountry}/home`,
    pathMatch: 'full',
  },

  // Root 404 Route (No Country Code)
  {
    path: '404',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },

  // Troubleshoot Route
  {
    path: 'y/troubleshoot',
    loadComponent: () =>
      import('./features/troubleshoot/troubleshoot.component').then(
        (m) => m.TroubleshootComponent
      ),
  },

  // ─── Country-prefixed routes ────────────────────────────────────
  {
    path: ':countryCode',
    loadComponent: () =>
      import('./layout/country-layout/country-layout.component').then(
        (m) => m.CountryLayoutComponent
      ),
    children: [
      // Home
      {
        path: 'home',
        loadComponent: () =>
          import('./features/home/home.component').then((m) => m.HomeComponent),
      },

      // Course Detail (single course page)
      {
        path: 'single/:courseSlug',
        loadComponent: () =>
          import('./features/course-detail/course-detail.component').then(
            (m) => m.CourseDetailComponent
          ),
      },

      // Category listing
      {
        path: 'category/:categorySlug',
        loadComponent: () =>
          import('./features/category/category.component').then(
            (m) => m.CategoryComponent
          ),
      },

      // Subscribe — with optional coupon code
      {
        path: 'subscribe/:couponCode',
        loadComponent: () =>
          import('./features/subscribe/subscribe.component').then(
            (m) => m.SubscribeComponent
          ),
      },
      {
        path: 'subscribe',
        loadComponent: () =>
          import('./features/subscribe/subscribe.component').then(
            (m) => m.SubscribeComponent
          ),
      },
      {
        path: 'checkout',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/checkout/checkout.component').then(
            (m) => m.CheckoutComponent
          ),
      },

      // Learning Paths
      {
        path: 'learning-paths/:pathSlug',
        loadComponent: () =>
          import('./features/learning-paths/learning-paths.component').then(
            (m) => m.LearningPathsComponent
          ),
      },
      {
        path: 'learning-paths',
        loadComponent: () =>
          import('./features/learning-paths/learning-paths.component').then(
            (m) => m.LearningPathsComponent
          ),
      },

      // Instructor profile

      {
        path: 'instructors/:instructorSlug',
        loadComponent: () =>
          import('./features/instructor/instructor.component').then(
            (m) => m.InstructorComponent
          ),
      },

      // Auth routes
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then(
            (m) => m.LoginComponent
          ),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then(
            (m) => m.RegisterComponent
          ),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./features/auth/reset-password/reset-password.component').then(
            (m) => m.ResetPasswordComponent
          ),
      },

      // Search & Browse
      {
        path: 'search',
        loadComponent: () =>
          import('./features/search/search.component').then(
            (m) => m.SearchComponent
          ),
      },
      {
        path: 'browse',
        loadComponent: () =>
          import('./features/browse/browse.component').then(
            (m) => m.BrowseComponent
          ),
      },

      // Profile (will be auth-guarded)
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/profile/profile.component').then(
            (m) => m.ProfileComponent
          ),
      },

      // Coach Registration
      {
        path: 'coach-registration',
        loadComponent: () =>
          import('./features/coach-registration/coach-registration.component').then(
            (m) => m.CoachRegistrationComponent
          ),
      },

      // Support (note: original URL is /y/support)
      {
        path: 'y/support',
        loadComponent: () =>
          import('./features/support/support.component').then(
            (m) => m.SupportComponent
          ),
      },

      // Static pages
      {
        path: 'terms-and-conditions',
        loadComponent: () =>
          import('./features/static/terms/terms.component').then(
            (m) => m.TermsComponent
          ),
      },
      {
        path: 'privacy-and-policy',
        loadComponent: () =>
          import('./features/static/privacy/privacy.component').then(
            (m) => m.PrivacyComponent
          ),
      },
      {
        path: 'thank-you',
        loadComponent: () =>
          import('./features/static/thank-you/thank-you.component').then(
            (m) => m.ThankYouComponent
          ),
      },

      // Country-level default redirect
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },

      // Country-level wildcard -> global 404
      {
        path: '**',
        redirectTo: '/404',
      },
    ],
  },

  // 🌐 Wildcard -> redirect to global 404 🌐
  {
    path: '**',
    redirectTo: '/404',
  },
];
