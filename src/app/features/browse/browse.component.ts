import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CourseCardComponent } from '../../shared/components/course-card/course-card.component';
import { CourseService } from '../../core/services/course.service';
import { CountryService } from '../../core/services/country.service';
import { AuthService } from '../../core/services/auth.service';
import { Course } from '../../core/models/course.model';

@Component({
  selector: 'app-browse',
  standalone: true,
  imports: [CommonModule, RouterLink, CourseCardComponent],
  template: `
    <div class="page_header py-4 text-center bg-light border-bottom" dir="rtl">
      <div class="container">
        <h2 class="font-weight-bold text-dark mb-0">تصفح الكورسات</h2>
      </div>
    </div>
    
    <div class="browse_wrapper py-5 text-right" dir="rtl">
      <div class="container-fluid px-md-5">
        <div class="row">
          
          <!-- Categories Sidebar (3 cols) -->
          <div class="col-lg-3 col-md-4 col-sm-12 mb-4">
            <div class="browse_cat p-4 border rounded-xl bg-white shadow-sm">
              <h4 class="font-weight-bold mb-4 text-dark pb-2 border-bottom">تصفح الاقسام</h4>
              <ul class="list-unstyled pr-0">
                <li class="mb-2" *ngFor="let cat of categories">
                  <a 
                    [routerLink]="getLink('/category/' + cat.slug)" 
                    class="d-block p-2 rounded text-dark text-decoration-none category-sidebar-link"
                  >
                    {{ cat.name }}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <!-- Courses Grid (9 cols) -->
          <div class="col-lg-9 col-md-8 col-sm-12">
            <section class="h_recent_courses pb-5" id="courses-grid">
              <div class="d-flex align-items-center justify-content-between mb-4">
                <h3 class="font-weight-bold text-dark mb-0">جميع الكورسات</h3>
                <span class="badge badge-light p-2 text-dark">{{ courses.length }} دورة تدريبية</span>
              </div>
              
              <div class="row">
                <div class="col-xl-4 col-lg-6 col-md-6 col-sm-6 col-xs-12 mb-4" *ngFor="let course of visibleCourses">
                  <course-widget [course]="course"></course-widget>
                </div>
              </div>
              
              <!-- Load More Button -->
              <div class="text-center mt-5" *ngIf="visibleCourses.length < courses.length">
                <button 
                  class="cta-button cta-button-primary px-5 py-3 d-inline-block font-weight-bold" 
                  type="button" 
                  (click)="loadMore()"
                >
                  عرض المزيد من الكورسات
                </button>
              </div>
            </section>
          </div>
          
        </div>
      </div>
    </div>
  `,
  styles: [`
    .category-sidebar-link {
      transition: all 0.2s ease-in-out;
    }
    .category-sidebar-link:hover {
      background-color: #effcf5;
      color: #00a26b !important;
      padding-right: 12px !important;
    }
  `]
})
export class BrowseComponent implements OnInit {
  courses: Course[] = [];
  visibleCourses: Course[] = [];
  categories: { slug: string, name: string }[] = [];
  pageSize = 12;

  private courseService = inject(CourseService);
  private countryService = inject(CountryService);
  private authService = inject(AuthService);

  currentUser$ = this.authService.currentUser$;

  ngOnInit(): void {
    this.courses = this.courseService.getAllCourses();
    this.visibleCourses = this.courses.slice(0, this.pageSize);
    
    // Load categories
    this.categories = Object.entries(this.courseService['categoriesMap']).map(([slug, name]) => ({
      slug,
      name
    }));
  }

  loadMore(): void {
    const currentLength = this.visibleCourses.length;
    const nextBatch = this.courses.slice(currentLength, currentLength + this.pageSize);
    this.visibleCourses = [...this.visibleCourses, ...nextBatch];
  }

  getLink(path: string): string {
    return this.countryService.link(path);
  }

  scrollToCourses(): void {
    const element = document.getElementById('courses-grid');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
