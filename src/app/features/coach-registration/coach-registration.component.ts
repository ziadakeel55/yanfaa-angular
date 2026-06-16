import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-coach-registration',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="terms-conditions text-right pb-5" dir="rtl">
      <div class="container pb-5">
        <h1 class="h1 py-5 mb-3 text-center">الانضمام كمحاضر</h1>
        <div>
          <h2>إذا كان لديك أكثر من ٥ سنين خبرة في مجال عملك وتريد الانضمام إلى محاضرين منصة ينفع قم بمراسلتنا عبر البريد الالكتروني: <br><br><a href="mailto:hello&#64;yanfaa.ddns.net" style="color: #007bff; text-decoration: none; font-weight: 500;">hello&#64;yanfaa.ddns.net</a></h2>
          <h3 style="margin: 0 0 5px 0; padding-top: 10px;">قم بإرسال
            <ul style="margin: 20px 0 10px 0; padding: 0 40px 0 0;">
              <li>السيرة الذاتية</li>
              <li>مكان الاقامة</li>
              <li>سابقة الأعمال ان وجدت</li>
              <li>عنوان الدورة التدريبية</li>
              <li>المادة العلمية للدورة التدريبية</li>
            </ul>
          </h3>
        </div>
      </div>
    </div>
  `
})
export class CoachRegistrationComponent {}

