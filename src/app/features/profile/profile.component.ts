import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { CourseService } from '../../core/services/course.service';
import { CountryService } from '../../core/services/country.service';
import { CourseCardComponent } from '../../shared/components/course-card/course-card.component';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CountryDropdownComponent } from '../../shared/components/country-dropdown/country-dropdown.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, CourseCardComponent, FormsModule, CountryDropdownComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private courseService = inject(CourseService);
  public countryService = inject(CountryService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private location = inject(Location);
  
  user$ = this.authService.currentUser$;
  favoriteCourses$ = this.courseService.favoriteCourses$;
  watchingCourses$ = this.courseService.watchingCourses$;
  userCertificates$ = this.courseService.userCertificates$;
  completedCourses: any[] = [];

  activeTab: string = 'subscription';
  profilePhone = '';

  ngOnInit() {
    // Read the hash fragment on load to set the initial tab
    let hash = window.location.hash;
    if (hash && hash.length > 1) {
      let tabName = hash.substring(1);
      // Ensure it's a valid tab
      if (['changePassword', 'yanfaaUser', 'account', 'certificates', 'courses'].includes(tabName)) {
        this.activeTab = tabName;
      }
    }

    // Subscribe to watching courses to dynamically calculate completed courses
    this.watchingCourses$.subscribe(courses => {
      this.completedCourses = courses.filter(c => {
        const totalLessons = c.lessonsCount || 15;
        const maxReached = c.maxLessonReached !== undefined ? c.maxLessonReached : -1;
        return maxReached >= totalLessons - 1;
      });
    });
  }

  setTab(tab: string) {
    this.activeTab = tab;
    // Update the hash only for specific tabs, keeping it unchanged for 'subscription' and 'help'
    if (['changePassword', 'yanfaaUser', 'account', 'certificates', 'courses'].includes(tab)) {
      this.location.replaceState(this.location.path(false) + '#' + tab);
    }
  }

  onTroubleshootClick(event: Event) {
    event.preventDefault();
    const user = this.authService.currentUser;
    if (user && !user.isSubscribed) {
      this.toastr.error('لم يتم العثور على دورات متاحة.');
      this.router.navigate([this.countryService.link('/home')]);
    } else {
      window.location.href = '/y/troubleshoot';
    }
  }
}
