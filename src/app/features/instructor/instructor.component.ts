import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CourseService } from '../../core/services/course.service';
import { Course, Instructor } from '../../core/models/course.model';
import { CourseCardComponent } from '../../shared/components/course-card/course-card.component';

@Component({
  selector: 'app-instructor',
  standalone: true,
  imports: [CommonModule, CourseCardComponent],
  styles: [
    `
      .author_social ul li {
        width: 53px;
        height: 55px;
        line-height: 62px;
        border-radius: 50%;
        background-color: #30304d;
        margin: 25px 8px 0;
        display: inline-block;
        text-align: center;
        transition: all 0.3s ease-in-out;
      }
      .author_social ul li a {
        color: #fff;
      }
    `,
  ],
  template: `
    <div class="container mt-5" *ngIf="instructor">
      <div class="instructor-data text-center pb-5">
        <img
          [src]="instructor.avatar || '/assets/images/icons/default-avatar.svg'"
          [alt]="'instructor-avatar'"
          class="mb-3"
          (error)="onImageError($event)"
          style="width: 220px; border-radius: 50%;"
        />
        <h2 class="py-3">{{ instructor.name }}</h2>
        <h3 *ngIf="instructor.title">{{ instructor.title }}</h3>
        <!---->
        <p class="pt-2" *ngIf="instructor.bio" [innerHTML]="instructor.bio"></p>
        <div class="author_social">
          <ul
            class="inline-list list"
            [innerHTML]="instructor.socialHtml || ''"
          ></ul>
        </div>
      </div>

      <div class="pt-4 h_featured_courses h_section_l">
        <div class="row">
          <div
            class="col-md-4 col-sm-6 col-xs-12"
            *ngFor="let course of courses"
          >
            <course-widget [course]="course"></course-widget>
          </div>
        </div>
        <div
          class="alert alert-warning text-center"
          *ngIf="courses.length === 0"
        >
          لم يتم العثور على دورات تدريبية لهذا المحاضر حالياً.
        </div>
      </div>
      <div class="row justify-content-center"></div>
    </div>
  `,
})
export class InstructorComponent implements OnInit {
  instructorSlug = '';
  instructor: Instructor | null = null;
  courses: Course[] = [];

  private route = inject(ActivatedRoute);
  private courseService = inject(CourseService);

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.instructorSlug = params['instructorSlug'] || '';
      if (this.instructorSlug) {
        this.instructor = this.courseService.getInstructorBySlug(
          this.instructorSlug,
        );
        if (this.instructor) {
          this.courses = this.courseService.getInstructorCourses(
            this.instructor.name,
          );
        }
      }
    });
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/assets/images/icons/default-avatar.svg';
  }
}
