import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { COUNTRIES_DATA } from '../../../core/models/countries.data';

@Component({
  selector: 'app-country-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="iti iti--allow-dropdown">
      <div class="iti__flag-container" dropdown="">
        <div class="iti__selected-flag dropdown-toggle" (click)="toggleDropdown()" aria-haspopup="true">
          <div class="iti__flag" [ngClass]="'iti__' + selectedCountryCode"></div>
          <div class="iti__arrow"></div>
        </div>
        <div class="dropdown-menu country-dropdown" [class.show]="isOpen" style="inset: 100% auto auto 0px; transform: translateY(0px);">
          <div class="search-container">
            <input autofocus="" id="country-search-box" placeholder="ابحث عن دولتك" class="form-control" [(ngModel)]="searchQuery" (click)="$event.stopPropagation()">
          </div>
          <ul class="iti__country-list">
            <ng-container *ngFor="let c of filteredCountries">
              <li class="iti__country" [class.iti__preferred]="c.preferred" [class.iti__standard]="!c.preferred" (click)="selectCountry(c.code, c.dialCode)">
                <div class="iti__flag-box"><div class="iti__flag" [ngClass]="'iti__' + c.code"></div></div>
                <span class="iti__country-name">{{ c.name }}</span>
                <span class="iti__dial-code">{{ c.dialCode }}</span>
              </li>
              <li class="iti__divider" *ngIf="c.preferred && isLastPreferred(c)"></li>
            </ng-container>
          </ul>
        </div>
      </div>
      <input autocomplete="off" type="tel" class="form-control" [id]="inputId" [name]="inputName" [placeholder]="placeholder" validation="true" [(ngModel)]="phoneNumber" (ngModelChange)="onPhoneChange($event)">
    </div>
  `,
  styles: [`
    .search-container { padding: 10px; position: relative; }
    .search-container input { width: 100%; border: 1px solid #ccc; border-radius: 4px; padding: 5px 10px; }
    .dropdown-menu { max-height: 300px; overflow-y: auto; }
    li.iti__country:hover { background-color: rgba(0,0,0,.05); }
    .iti__selected-flag.dropdown-toggle:after { content: none; }
    .iti__flag-container.disabled { cursor: default!important; }
    .iti.iti--allow-dropdown .flag-container.disabled:hover .iti__selected-flag { background: 0 0; }
    .country-dropdown { border: 1px solid #ccc; width: fit-content; padding: 1px; border-collapse: collapse; }
    .search-icon { position: absolute; z-index: 2; width: 25px; margin: 1px 10px; }
    .iti__country-list { position: relative; border: none; }
    .iti input#country-search-box { padding-left: 6px; }
    .iti .selected-dial-code { margin-left: 6px; }
    .iti.separate-dial-code .iti__selected-flag, .iti.separate-dial-code.iti--allow-dropdown.iti-sdc-2 .iti__selected-flag, .iti.separate-dial-code.iti--allow-dropdown.iti-sdc-3 .iti__selected-flag, .iti.separate-dial-code.iti--allow-dropdown.iti-sdc-4 .iti__selected-flag { width: 93px; }
    .iti.separate-dial-code input, .iti.separate-dial-code.iti--allow-dropdown.iti-sdc-2 input, .iti.separate-dial-code.iti--allow-dropdown.iti-sdc-3 input, .iti.separate-dial-code.iti--allow-dropdown.iti-sdc-4 input { padding-left: 98px; }
    .iti { width: 100%; display: block; }
  `]
})
export class CountryDropdownComponent implements OnInit {
  @Input() inputId = 'phone';
  @Input() inputName = 'phoneInput';
  @Input() placeholder = '+20 2 34567890';
  @Input() initialPhone = '';
  @Output() phoneChange = new EventEmitter<string>();

  isOpen = false;
  searchQuery = '';
  selectedCountryCode = 'eg';
  phoneNumber = '';

  countries = COUNTRIES_DATA;

  ngOnInit() {
    this.phoneNumber = this.initialPhone;
  }

  get filteredCountries() {
    if (!this.searchQuery) return this.countries;
    const q = this.searchQuery.toLowerCase();
    return this.countries.filter((c: any) => c.name.toLowerCase().includes(q) || c.dialCode.includes(q));
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.searchQuery = '';
    }
  }

  selectCountry(code: string, dialCode: string) {
    this.selectedCountryCode = code;
    if (!this.phoneNumber.startsWith(dialCode)) {
      this.phoneNumber = dialCode + ' ';
      this.onPhoneChange(this.phoneNumber);
    }
    this.isOpen = false;
  }

  onPhoneChange(val: string) {
    this.phoneNumber = val;
    this.phoneChange.emit(this.phoneNumber);
  }

  isLastPreferred(c: any): boolean {
    const preferred = this.filteredCountries.filter((x: any) => x.preferred);
    return preferred.length > 0 && preferred[preferred.length - 1] === c;
  }
}
