import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CountryService } from '../../../core/services/country.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingScreenComponent } from '../../../shared/components/loading-screen/loading-screen.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoadingScreenComponent],
  styles: [`
    .form-group { margin-bottom: 30px; }
    .form-group label { color: #8f8f8f; font-size: 16px; font-style: normal; font-weight: 500; line-height: normal; margin-bottom: 10px; }
    .form-group label.form-check-label { margin-bottom: 0; margin-right: 20px; }
    .form-group .form-control { border-radius: 10px; background: #fff; border: 1px solid rgba(206, 206, 206, .68); padding: 16px; height: auto; font-size: 16px; }
    .form-group.form-check { display: flex; align-items: center; margin-bottom: 0; }
    .login-page { margin: 60px 0; font-size: 18px; }
    .login-page h2 { margin-bottom: 30px; }
    .login-page a { margin: 0; padding: 0; }
    .login-page .cta-button { margin: 30px 0; padding-left: 60px; padding-right: 60px; }
  `],
  template: `
    <app-loading-screen [isLoading]="isLoading"></app-loading-screen>
    <section class="login-page">
      <div class="container">
        <h2 class="text-center">استعادة كلمة المرور</h2>
        <div class="row justify-content-center">
          <div class="col-md-6 col-xs-12">
            
            <form class="text-right" novalidate (submit)="onSubmit($event)">
              <div class="form-group">
                <label for="resetInputEmail">البريد الالكتروني</label>
                <input aria-describedby="emailHelp" class="form-control" id="resetInputEmail" name="email" type="email" [(ngModel)]="email" required>
              </div>
              
              <div class="text-center">
                <button class="cta-button cta-button-primary" type="submit">نسيت كلمة المرور</button>
              </div>
              
              <span class="d-block text-center border-sides py-4 my-4">أو</span>
              
              <div class="text-center">
                لديك حساب؟ قم <a [routerLink]="getLink('/login')">بالضغط هنا</a> لتسجيل الدخول
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  `
})
export class ResetPasswordComponent {
  email = '';
  isLoading = false;

  private countryService = inject(CountryService);
  private toastr = inject(ToastrService);

  onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.email.trim()) {
      this.toastr.error('قم بادخال البريد الالكترونى الخاص بك');
      return;
    }
    
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      this.toastr.success('تم إرسال رابط استعادة كلمة المرور بنجاح. يرجى التحقق من بريدك الوارد.');
    }, 1000);
  }

  getLink(path: string): string {
    return this.countryService.link(path);
  }
}
