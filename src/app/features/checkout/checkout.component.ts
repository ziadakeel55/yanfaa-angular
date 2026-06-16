import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CountryService } from '../../core/services/country.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private countryService = inject(CountryService);

  planName = 'سنوي';
  originalPrice = 0;
  currentPrice = 2000;
  hasCoupon = false;
  
  paymentMethod: string | null = null; // 'offline' for Fawry, 'online' for Credit Card

  ngOnInit(): void {
    const state = history.state || {};
    this.hasCoupon = state.hasDiscount === true; // Check if coupon is applied
    if (state.plan === 'monthly') {
      this.planName = 'شهري';
      this.originalPrice = 0; // No strike-through for monthly
      this.currentPrice = 399;
    } else {
      this.planName = 'سنوي';
      if (this.hasCoupon) {
        this.originalPrice = 2000;
        this.currentPrice = 399;
      } else {
        this.originalPrice = 0; // No strike-through
        this.currentPrice = 2000;
      }
    }
  }

  onSubscribe(): void {
    if (!this.paymentMethod) return;
    
    if (this.paymentMethod === 'offline') {
      this.toastr.success('تم اختيار الدفع عن طريق فوري بنجاح!');
    } else {
      this.toastr.success('تم اختيار الدفع عن طريق البطاقة الائتمانية بنجاح!');
    }
  }
}
