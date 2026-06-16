import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CourseCardComponent } from '../../shared/components/course-card/course-card.component';
import { CourseService, LearningPath } from '../../core/services/course.service';
import { CountryService } from '../../core/services/country.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-learning-paths',
  standalone: true,
  imports: [CommonModule, RouterLink, CourseCardComponent],
  templateUrl: './learning-paths.component.html',
  styleUrls: ['./learning-paths.component.css']
})
export class LearningPathsComponent implements OnInit {
  pathSlug = '';
  activePath!: LearningPath;
  allPaths: LearningPath[] = [];

  private route = inject(ActivatedRoute);
  private courseService = inject(CourseService);
  private countryService = inject(CountryService);
  private authService = inject(AuthService);

  currentUser$ = this.authService.currentUser$;

  ngOnInit(): void {
    // Load all learning paths
    this.allPaths = this.courseService.getAllLearningPaths();

    this.route.params.subscribe(params => {
      this.pathSlug = params['pathSlug'] || '';
      if (this.pathSlug) {
        this.activePath = this.courseService.getLearningPathBySlug(this.pathSlug);
      }
    });
  }

  getLink(path: string): string {
    return this.countryService.link(path);
  }

  scrollToCourses(): void {
    const element = document.getElementById('all-paths');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
