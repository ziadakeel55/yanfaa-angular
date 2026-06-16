import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="container">
      <div class="py-5 my-5 text-right">
        <p>للمساعدة والدعم تواصل معنا عبر البريد الالكتروني <a href="mailto:help&#64;yanfaa.ddns.net">help&#64;yanfaa.ddns.net</a></p>
      </div>
    </section>
  `
})
export class SupportComponent {}
