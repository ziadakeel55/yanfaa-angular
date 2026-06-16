/**
 * Yanfaa Angular — Development Environment Configuration
 *
 * This file is the single source of truth for all configuration values.
 * The `domain` value is used for SEO canonical URLs, OG meta tags, and sitemap generation.
 * All analytics IDs are extracted from the original cloned site's HTML.
 */
export const environment = {
  production: false,

  // ─── Domain & API ─────────────────────────────────────────────
  domain: 'https://yanfaa.ddns.net',
  apiBaseUrl: 'http://localhost:3000/api',

  // ─── Country / Localization ───────────────────────────────────
  defaultCountry: 'eg',
  supportedCountries: ['eg', 'sa', 'ae', 'us', 'kw', 'bh'],

  // ─── reCAPTCHA ────────────────────────────────────────────────
  recaptchaSiteKey: '6LdBKGQqAAAAAI5L9my_wewQtoeZC1v42KC6oWfS',

  // ─── Google Tag Manager ───────────────────────────────────────
  gtmId: 'GTM-WF28VR7',

  // ─── Google Analytics (GA4) ───────────────────────────────────
  gaIds: ['G-Z6FR79EDL7', 'G-ZZY878CXS0'],

  // ─── Google Ads ───────────────────────────────────────────────
  gadsIds: ['AW-622146125', 'AW-16623767560'],

  // ─── Facebook / Meta ──────────────────────────────────────────
  fbPixelId: '608343190136417',
  fbAppId: '648177629190502',

  // ─── TikTok Pixel ─────────────────────────────────────────────
  tiktokPixelId: 'D3DQJ8RC77UF12B9UTD0',

  // ─── Microsoft Clarity ────────────────────────────────────────
  clarityId: 'q8z88pc9vi',

  // ─── LinkedIn Insight Tag ─────────────────────────────────────
  linkedinPartnerId: '',  // Extract from the site's LinkedIn tag when available

  // ─── Google Site Verification ─────────────────────────────────
  googleSiteVerification: '-U9IW8BvPzuJJd-PpLwxY5_o3qGJgNzeTJEA5YgVB_U',

  // ─── App Metadata ─────────────────────────────────────────────
  appName: 'Yanfaa.com - ينفع.كوم',
  appDescription: 'ينفع هي اول منصة تعليمية عربية تمكنك من مشاهدة جميع الكورسات في مجالات مختلفة باشتراك واحد يناسب ميزانيتك.',
  appLocale: 'ar_AR',
  defaultOgImage: 'assets/images/og/yanfaa.png',

  // ─── Feature Flags ────────────────────────────────────────────
  enableAnalytics: false,   // Disabled in dev
  enableNewRelic: false,
  coursesPerPage: 6,

  // ─── Coupons & Discounts ──────────────────────────────────────
  discountConfig: {
    couponCode: 'YANFAAPRO', // Replace with desired code
    annualOriginalMonthlyPrice: 167,
    annualOriginalTotal: 2000,
    annualDiscountedMonthlyPrice: 33,
    annualDiscountedTotal: 399
  }
};
