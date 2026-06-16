import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CountryService } from '../../../core/services/country.service';
import { AuthResponse } from '../../../core/models/user.model';
import { ToastrService } from 'ngx-toastr';
import { LoadingScreenComponent } from '../../../shared/components/loading-screen/loading-screen.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoadingScreenComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  rememberMe = false;
  isLoading = false;
  errorMessage = '';

  private authService = inject(AuthService);
  private countryService = inject(CountryService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  onSubmit(event: Event): void {
    event.preventDefault();
    let hasError = false;

    if (!this.email) {
      this.toastr.error('قم بادخال البريد الالكترونى الخاص بك');
      hasError = true;
    }
    if (!this.password) {
      this.toastr.error('قم بادخال كلمة المرور');
      hasError = true;
    }

    if (hasError) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response: AuthResponse) => {
        this.isLoading = false;
        this.router.navigate([this.countryService.link('/home')]);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.toastr.error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      }
    });
  }

  getLink(path: string): string {
    return this.countryService.link(path);
  }
}
