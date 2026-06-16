import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CourseCardComponent } from '../../shared/components/course-card/course-card.component';
import { CourseService } from '../../core/services/course.service';
import { CountryService } from '../../core/services/country.service';
import { Course } from '../../core/models/course.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterLink, CourseCardComponent],
  template: `
    <section class="h_featured_courses h_section_l mt-5" dir="rtl">
      <div class="container py-5 text-right">
        <div class="d-flex align-items-center mb-5 justify-content-between">
          <h2 class="sub-heading mb-0 text-dark font-weight-bold">
            نتائج البحث عن: <span class="text-success">"{{ query }}"</span>
          </h2>
          <span class="badge badge-light p-2 text-dark">{{ filteredCourses.length }} دورة تدريبية</span>
        </div>
        
        <div class="row" *ngIf="filteredCourses.length > 0; else noResults">
          <div class="col-lg-4 col-md-6 col-sm-6 col-xs-12 mb-4" *ngFor="let course of filteredCourses">
            <course-widget [course]="course"></course-widget>
          </div>
        </div>

        <ng-template #noResults>
          <div class="text-center py-5 my-5 w-100">
            <div class="mb-4">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-muted d-inline-block">
                <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="currentColor"></path>
              </svg>
            </div>
            <p class="h4 text-muted font-weight-bold mb-3">لم نجد أي نتائج لـ "{{ query }}"</p>
            <p class="text-muted lead">تأكد من كتابة الكلمات بشكل صحيح أو جرب كلمات بحث أخرى.</p>
            <a class="cta-button cta-button-primary d-inline-block mt-4" [routerLink]="getLink('/home')">العودة للرئيسية</a>
          </div>
        </ng-template>
      </div>
    </section>
  `
})
export class SearchComponent implements OnInit {
  query = '';
  filteredCourses: Course[] = [];

  private route = inject(ActivatedRoute);
  private courseService = inject(CourseService);
  private countryService = inject(CountryService);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.query = params['q'] || '';
      this.searchCourses();
    });
  }

  searchCourses(): void {
    if (!this.query.trim()) {
      this.filteredCourses = [];
      return;
    }
    const term = this.query.trim().toLowerCase();
    this.filteredCourses = this.courseService.getAllCourses().filter(c => 
      c.title.toLowerCase().includes(term) || 
      (c.description && c.description.toLowerCase().includes(term)) ||
      (c.instructor?.name && c.instructor.name.toLowerCase().includes(term)) ||
      (c.category && c.category.toLowerCase().includes(term))
    );
  }

  getLink(path: string): string {
    return this.countryService.link(path);
  }
}
