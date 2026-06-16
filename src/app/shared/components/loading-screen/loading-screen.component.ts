import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-screen',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progress" *ngIf="isLoading">
      <div class="indeterminate"></div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: relative;
      z-index: 9999;
    }
    .progress {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      margin: 0;
      background-color: rgba(9, 212, 145, 0.2);
      overflow: hidden;
      z-index: 999999;
    }
    .indeterminate {
      background-color: #09d491;
      width: 100%;
      height: 100%;
      position: absolute;
      left: -100%;
      animation: indeterminate 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
    }
    @keyframes indeterminate {
      0% { left: -100%; width: 100%; }
      50% { left: 100%; width: 10%; }
      100% { left: 100%; width: 10%; }
    }
  `]
})
export class LoadingScreenComponent {
  @Input() isLoading = false;
}
