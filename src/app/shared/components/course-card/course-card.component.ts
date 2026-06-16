import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Course } from '../../../core/models/course.model';
import { CountryService } from '../../../core/services/country.service';
import { AuthService } from '../../../core/services/auth.service';
import { CourseService } from '../../../core/services/course.service';

@Component({
  selector: 'course-widget',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './course-card.component.html',
  styleUrls: ['./course-card.component.css']
})
export class CourseCardComponent implements OnInit {
  @Input({ required: true }) course!: Course;
  @Input() stepNumber?: number;
  @Input() isWatching = false;
  
  public authService = inject(AuthService);
  public courseService = inject(CourseService);

  get isFavorite(): boolean {
    return this.courseService.isFavorite(this.course.slug);
  }

  constructor(public countryService: CountryService) {}

  ngOnInit(): void {}

  getCourseLink(): string {
    return this.countryService.link(`/single/${this.course.slug}`);
  }

  toggleFavorite(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.courseService.toggleFavorite(this.course);
  }

  removeWatching(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.course) {
      this.courseService.removeWatching(this.course.slug);
    }
  }

  // Handle fallback images
  onImageError(event: Event, type: 'course' | 'author'): void {
    const imgElement = event.target as HTMLImageElement;
    
    // Prevent infinite loop if fallback image is missing
    if (imgElement.dataset['errorHandled']) return;
    imgElement.dataset['errorHandled'] = 'true';

    if (type === 'course') {
      // Use a logo or placeholder that definitely exists
      imgElement.src = '/assets/images/icons/yanfaa.png'; 
    } else {
      imgElement.src = '/assets/images/icons/default-avatar.svg';
    }
  }
}
