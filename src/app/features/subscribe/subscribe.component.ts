import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/services/auth.service';
import { CountryService } from '../../core/services/country.service';

import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-subscribe',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subscribe.component.html',
  styleUrls: ['./subscribe.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SubscribeComponent implements OnInit {
  couponCode = '';
  couponInput = '';

  // Plan Pricing
  annualPrice = 167;
  annualTotal = 2000;
  monthlyPrice = 399;
  
  // Track original prices for the UI
  hasDiscount = false;
  annualOriginalPrice = 167;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService,
    private countryService: CountryService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.couponCode = params['couponCode'] || '';
      if (this.couponCode) {
        this.couponInput = this.couponCode;
        this.validateCoupon(this.couponCode);
      }
    });
  }

  applyCouponCode(event: Event): void {
    event.preventDefault();
    if (!this.couponInput.trim()) {
      this.hasDiscount = false;
      return;
    }
    this.validateCoupon(this.couponInput);
  }

  validateCoupon(code: string): void {
    const config = environment.discountConfig;
    if (code.toUpperCase() === config.couponCode) {
      this.hasDiscount = true;
      this.toastr.success('تم تفعيل كود الخصم');
      this.annualPrice = config.annualDiscountedMonthlyPrice;
      this.annualTotal = config.annualDiscountedTotal;
      this.annualOriginalPrice = config.annualOriginalMonthlyPrice;
    } else if (code.toUpperCase() === 'FREE' || code.toUpperCase() === 'YANFAA') {
      this.hasDiscount = false;
      this.toastr.success('تم تفعيل كود الخصم');
      this.annualPrice = 133;
      this.annualTotal = 1600;
      this.monthlyPrice = 319;
    } else {
      this.hasDiscount = false;
      this.toastr.error('هذا الكوبون غير صحيح!');
      // Reset prices
      this.annualPrice = 167;
      this.annualTotal = 2000;
      this.monthlyPrice = 399;
    }
  }

  selectPlan(plan: 'annual' | 'monthly'): void {
    console.log(`Plan selected: ${plan}`);
  }

  subscribePlan(plan: 'annual' | 'monthly', event: Event): void {
    event.stopPropagation(); // Avoid triggering card click
    
    if (this.authService.isLoggedIn) {
      this.router.navigate([this.countryService.link('/checkout')], { state: { plan, hasDiscount: this.hasDiscount } });
    } else {
      this.toastr.info('يرجى تسجيل الدخول أولاً للاشتراك.');
      this.router.navigate([this.countryService.link('/login')]);
    }
  }
}
