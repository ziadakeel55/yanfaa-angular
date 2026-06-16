/**
 * Yanfaa Angular — Production Environment Configuration
 */
export const environment = {
  production: true,

  domain: 'https://yanfaa.ddns.net',
  apiBaseUrl: 'https://api.yanfaa.ddns.net/api',

  defaultCountry: 'eg',
  supportedCountries: ['eg', 'sa', 'ae', 'us', 'kw', 'bh'],

  recaptchaSiteKey: '6LdBKGQqAAAAAI5L9my_wewQtoeZC1v42KC6oWfS',

  gtmId: 'GTM-WF28VR7',
  gaIds: ['G-Z6FR79EDL7', 'G-ZZY878CXS0'],
  gadsIds: ['AW-622146125', 'AW-16623767560'],
  fbPixelId: '608343190136417',
  fbAppId: '648177629190502',
  tiktokPixelId: 'D3DQJ8RC77UF12B9UTD0',
  clarityId: 'q8z88pc9vi',
  linkedinPartnerId: '',
  googleSiteVerification: '-U9IW8BvPzuJJd-PpLwxY5_o3qGJgNzeTJEA5YgVB_U',

  appName: 'Yanfaa.com - ينفع.كوم',
  appDescription: 'ينفع هي اول منصة تعليمية عربية تمكنك من مشاهدة جميع الكورسات في مجالات مختلفة باشتراك واحد يناسب ميزانيتك.',
  appLocale: 'ar_AR',
  defaultOgImage: 'assets/images/og/yanfaa.png',

  enableAnalytics: true,
  enableNewRelic: true,
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
