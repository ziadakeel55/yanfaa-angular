import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CountryService } from '../../core/services/country.service';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent],
  styleUrls: ['./not-found.component.css'],
  template: `
    <app-header [hideOffer]="true"></app-header>
    <main>
      <section class="p-5 page_min-height d-flex align-items-center bg-light">
        <div class="container">
          <div class="text-center">
            <h1 class="display-1 text-success fw-bold mb-5">404</h1>
            <h2 class="mb-3">لم يتم العثور على المحتوى المطلوب</h2>
            <p class="text-muted mb-5">عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها</p>
            <div class="d-flex justify-content-center mt-5">
              <a [routerLink]="countryService.link('/home')" class="cta-button cta-button-primary">الصفحة الرئيسية</a>
            </div>
          </div>
        </div>
      </section>
    </main>
    <app-footer></app-footer>
  `
})
export class NotFoundComponent {
  public countryService = inject(CountryService);
}
