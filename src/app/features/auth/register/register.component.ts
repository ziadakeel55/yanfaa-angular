import { Component, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CountryService } from '../../../core/services/country.service';
import { AuthResponse } from '../../../core/models/user.model';
import { ToastrService } from 'ngx-toastr';
import { LoadingScreenComponent } from '../../../shared/components/loading-screen/loading-screen.component';
import { CountryDropdownComponent } from '../../../shared/components/country-dropdown/country-dropdown.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoadingScreenComponent, CountryDropdownComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
        <h2 class="text-center">تسجيل حساب</h2>
        <div class="row justify-content-center">
          <div class="col-md-8 col-xs-12">
            <form class="text-right" novalidate (submit)="onSubmit($event)">
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="firstName">الاسم الاول</label>
                    <input class="form-control" id="firstName" name="firstName" type="text" [(ngModel)]="firstName" required>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="lastName">الاسم الاخير</label>
                    <input class="form-control" id="lastName" name="lastName" type="text" [(ngModel)]="lastName" required>
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="signupInputEmail">البريد الالكتروني</label>
                    <input aria-describedby="emailHelp" class="form-control" id="signupInputEmail" name="signupInputEmail" type="email" [(ngModel)]="email" required>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="signupInputPhone">رقم الهاتف</label>
                    <app-country-dropdown 
                      [initialPhone]="phone" 
                      (phoneChange)="phone = $event" 
                      inputId="signupInputPhone" 
                      inputName="phoneInput" 
                      placeholder="+20 2 34567890">
                    </app-country-dropdown>
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="signupInputPassword">كلمة المرور</label>
                    <input class="form-control" id="signupInputPassword" name="signupInputPassword" type="password" [(ngModel)]="password" required>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="signupInputPassword2">تأكيد كلمة المرور</label>
                    <input class="form-control" id="signupInputPassword2" name="signupInputPassword2" type="password" [(ngModel)]="passwordConfirmation" required>
                  </div>
                </div>
              </div>

              <div class="rc-anchor-normal-footer"><div class="rc-anchor-logo-large" role="presentation"><div class="rc-anchor-logo-img rc-anchor-logo-img-large"></div></div><div class="rc-anchor-pt"></div></div>

              <div class="text-center">
                <button class="cta-button cta-button-primary" type="submit" [disabled]="isLoading">
                  {{ isLoading ? 'جاري تسجيل الحساب...' : 'تسجيل حساب' }}
                </button>
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
export class RegisterComponent {
  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  password = '';
  passwordConfirmation = '';
  isLoading = false;
  errorMessage = '';

  private authService = inject(AuthService);
  private countryService = inject(CountryService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  onSubmit(event: Event): void {
    event.preventDefault();
    let hasError = false;

    if (!this.firstName) {
      this.toastr.error('قم بادخال الاسم الاول');
      hasError = true;
    }
    if (!this.lastName) {
      this.toastr.error('قم بادخال الاسم الاخير');
      hasError = true;
    }
    if (!this.email) {
      this.toastr.error('قم بادخال البريد الالكترونى الخاص بك');
      hasError = true;
    }
    if (!this.phone) {
      this.toastr.error('قم بادخال رقم الهاتف');
      hasError = true;
    }
    if (!this.password) {
      this.toastr.error('قم بادخال كلمة المرور');
      hasError = true;
    }
    if (!this.passwordConfirmation) {
      this.toastr.error('قم بادخال تأكيد كلمة المرور');
      hasError = true;
    }

    if (hasError) return;

    if (this.password !== this.passwordConfirmation) {
      this.toastr.error('كلمتا المرور غير متطابقتين');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
      passwordConfirmation: this.passwordConfirmation,
      phone: this.phone
    }).subscribe({
      next: (response: AuthResponse) => {
        this.isLoading = false;
        this.router.navigate([this.countryService.link('/home')]);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.toastr.error('فشل التسجيل. يرجى التأكد من صحة البيانات.');
      }
    });
  }

  getLink(path: string): string {
    return this.countryService.link(path);
  }
}
