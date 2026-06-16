import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CountryService } from '../../../core/services/country.service';

@Component({
  selector: 'app-thank-you',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page_min-height d-flex align-items-center bg-light" dir="rtl">
      <div class="container my-5">
        <div class="container">
          <div class="text-center">
            <h1 class="static-page-icon text-warning fw-bold mb-4">
              <svg class="svg-inline--fa fa-hourglass fa-w-12" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="hourglass" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" style="width: 80px; height: 80px;">
                <path fill="currentColor" d="M360 64c13.255 0 24-10.745 24-24V24c0-13.255-10.745-24-24-24H24C10.745 0 0 10.745 0 24v16c0 13.255 10.745 24 24 24 0 90.965 51.016 167.734 120.842 192C75.016 280.266 24 357.035 24 448c-13.255 0-24 10.745-24 24v16c0 13.255 10.745 24 24 24h336c13.255 0 24-10.745 24-24v-16c0-13.255-10.745-24-24-24 0-90.965-51.016-167.734-120.842-192C308.984 231.734 360 154.965 360 64z"></path>
              </svg>
            </h1>
            <h2 class="mb-3">يرجى اتمام الدفع خلال ٢٤ ساعة</h2>
            <p class="text-muted mb-3">عند الدفع اخبر البائع برغبتك في دفع خدمة 'فوري باي' او اخبره بكود الدفع ٧٨٨ ثم قم بأعطائه الكود الخاص بك.</p>
            <p class="text-muted mb-5">اذا واجهتك اي مشاكل قم بمراسلتنا <a class="text-success" href="mailto:help&#64;yanfaa.ddns.net">help&#64;yanfaa.ddns.net</a></p>
            <div class="d-flex justify-content-center mt-5">
              <a class="cta-button cta-button-primary" [routerLink]="countryService.link('/home')">الصفحة الرئيسية</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class ThankYouComponent {
  public countryService = inject(CountryService);
}

