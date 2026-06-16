import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CourseCardComponent } from '../../shared/components/course-card/course-card.component';
import { CourseService } from '../../core/services/course.service';
import { CountryService } from '../../core/services/country.service';
import { AuthService } from '../../core/services/auth.service';
import { Course } from '../../core/models/course.model';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, RouterLink, CourseCardComponent],
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {
  categorySlug = '';
  categoryName = '';
  courses: Course[] = [];
  popularCourses: Course[] = [];
  recentCourses: Course[] = [];

  visibleRecentCoursesCount = 6;

  isDurationDropdownOpen = false;
  selectedDuration = 'شهر';

  private route = inject(ActivatedRoute);
  private courseService = inject(CourseService);
  private countryService = inject(CountryService);
  private authService = inject(AuthService);

  currentUser$ = this.authService.currentUser$;

  readonly languageSlugs = ['Languages', 'English', 'German', 'French', 'Spanish', 'Russian', 'Turkish'];

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.categorySlug = params['categorySlug'] || '';
      this.categoryName = this.courseService.getCategoryName(this.categorySlug);
      
      // Use page layouts for exact static ordering
      this.popularCourses = this.courseService.getPopularCourses(this.categorySlug);
      this.recentCourses = this.courseService.getRecentCourses(this.categorySlug);
      
      // Keep courses array for fallback or other uses
      this.courses = this.courseService.getCoursesByCategory(this.categorySlug);
      this.visibleRecentCoursesCount = 6;
      console.log('Category:', this.categorySlug, 'Recent Courses Length:', this.recentCourses.length);
    });
  }

  isLanguageSubCategory(): boolean {
    return this.languageSlugs.includes(this.categorySlug);
  }

  getLink(path: string): string {
    return this.countryService.link(path);
  }

  selectDuration(duration: string): void {
    this.selectedDuration = duration;
    this.isDurationDropdownOpen = false;
  }

  loadMoreRecentCourses(): void {
    this.visibleRecentCoursesCount += 6;
  }

  scrollToPopular(): void {
    const element = document.getElementById('popular-courses');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
