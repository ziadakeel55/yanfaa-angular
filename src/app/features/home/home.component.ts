import { Component, OnInit, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CourseCardComponent } from '../../shared/components/course-card/course-card.component';
import { CounterComponent } from '../../shared/components/counter/counter.component';
import { Course } from '../../core/models/course.model';
import { CountryService } from '../../core/services/country.service';
import { CourseService } from '../../core/services/course.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, CourseCardComponent, CounterComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  popularCourses: Course[] = [];
  recentCourses: Course[] = [];
  favoriteCourses$!: Observable<Course[]>;
  watchingCourses$!: Observable<Course[]>;
  
  visibleRecentCoursesCount = 6;
  isDurationDropdownOpen = false;
  selectedDuration = 'شهر';
  
  public countryService = inject(CountryService);
  private courseService = inject(CourseService);
  public authService = inject(AuthService);
  currentUser$ = this.authService.currentUser$;

  ngOnInit(): void {
    this.popularCourses = this.courseService.getPopularCourses('home');
    this.recentCourses = this.courseService.getRecentCourses('home');
    
    this.favoriteCourses$ = this.courseService.favoriteCourses$;
    this.watchingCourses$ = this.courseService.watchingCourses$;

    this.authService.currentUser$.subscribe((user: any) => {
      // Intentionally left blank or handle real user watch history fetching here
      // if it required an API call instead of localStorage.
    });
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
