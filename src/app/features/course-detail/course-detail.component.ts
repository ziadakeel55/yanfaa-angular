import { Component, OnInit, AfterViewInit, HostListener, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { CourseCardComponent } from '../../shared/components/course-card/course-card.component';
import { CourseService } from '../../core/services/course.service';
import { CountryService } from '../../core/services/country.service';
import { AuthService } from '../../core/services/auth.service';
import { Course } from '../../core/models/course.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CourseCardComponent],
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CourseDetailComponent implements OnInit, AfterViewInit {
  courseSlug = '';
  course: Course | null = null;
  relatedCourses: Course[] = [];
  safeCourseDetailsHtml: SafeHtml | null = null;
  safeInstructorSocialHtml: SafeHtml | null = null;
  sidebarStyle: { [key: string]: string } = {};

  isLoggedIn = false;
  isSubscribed = false;
  isFavorite = false;
  isPiPActive = false;
  forceClosePiP: boolean = false;

  dummyLessons: any[] = [];
  currentLessonIndex = 0;

  maxLessonReached = 0;

  constructor(private route: ActivatedRoute, private router: Router) {}

  closePiP(event: Event) {
    event.stopPropagation();
    this.forceClosePiP = true;
    this.isPiPActive = false;
  }

  get currentVideo() {
    return this.dummyLessons[this.currentLessonIndex];
  }

  get currentVideoEmbedUrl(): SafeResourceUrl {
    const video = this.currentVideo;
    if (!video) return this.sanitizer.bypassSecurityTrustResourceUrl('');
    
    const msgId = video.telegramMsgId || video.id;
    const chatId = video.telegramChatId || '-1003753481209';
    return this.sanitizer.bypassSecurityTrustResourceUrl(`${environment.streamBaseUrl}/stream/${chatId}/${msgId}`);
  }

  get currentVideoUrlString(): string {
    const video = this.currentVideo;
    if (!video) return '';
    
    // Extract msgId correctly whether it's an object or a number
    let msgId = video.id;
    let chatId = video.telegramChatId || '-1003753481209';
    
    if (video.telegramMsgId) {
      if (typeof video.telegramMsgId === 'object' && video.telegramMsgId.msg_id) {
        msgId = video.telegramMsgId.msg_id;
        chatId = video.telegramMsgId.chat_id || chatId;
      } else if (typeof video.telegramMsgId === 'number' || typeof video.telegramMsgId === 'string') {
        msgId = video.telegramMsgId;
      }
    }
    
    if (!msgId || msgId <= 0) return '';
    return `${environment.streamBaseUrl}/stream/${chatId}/${msgId}`;
  }


  private courseService = inject(CourseService);
  private countryService = inject(CountryService);
  private authService = inject(AuthService);
  private sanitizer = inject(DomSanitizer);

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.updateSidebarPosition();
  }

  @HostListener('window:resize', [])
  onWindowResize(): void {
    this.updateSidebarPosition();
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.isSubscribed = user?.isSubscribed || false;
      this.checkFavoriteStatus();
    });

    this.route.params.subscribe(params => {
      this.courseSlug = params['courseSlug'] || '';
      if (this.courseSlug) {
        this.course = this.courseService.getCourseBySlug(this.courseSlug);
        this.checkFavoriteStatus();
        
        if (this.course) {
          this.safeCourseDetailsHtml = this.sanitizer.bypassSecurityTrustHtml(
            this.course.courseDetailsHtml || this.course.description || ''
          );
          this.safeInstructorSocialHtml = this.course.instructorSocialHtml ? 
            this.sanitizer.bypassSecurityTrustHtml(this.course.instructorSocialHtml) : null;

          // Load related courses from extra metadata if available, otherwise fallback to category
          if (this.course.relatedSlugs && this.course.relatedSlugs.length > 0) {
            this.relatedCourses = this.course.relatedSlugs
              .map(slug => this.courseService.getCourseBySlug(slug))
              .filter(c => !!c);
          } else {
            const allInCategory = this.courseService.getCoursesByCategory(this.course.categorySlug);
            this.relatedCourses = allInCategory
              .filter(c => c.id !== this.course?.id)
              .slice(0, 3);
            
            if (this.relatedCourses.length < 3) {
              const others = this.courseService.getAllCourses()
                .filter(c => c.id !== this.course?.id && !this.relatedCourses.includes(c));
              this.relatedCourses = [...this.relatedCourses, ...others].slice(0, 3);
            }
          }

          // Trigger layout update after route parameter change
          setTimeout(() => this.updateSidebarPosition(), 100);

          // Populate lessons
          this.dummyLessons = [];
          if (this.course.videos && this.course.videos.length > 0) {
            this.dummyLessons = this.course.videos.map((v: any) => ({
                title: v.title,
                duration: v.duration_human ? v.duration_human.replace('minutes', '') : Math.round(v.duration / 60),
                videoId: v.brightcove_video_id,
                telegramMsgId: v.telegramMsgId,
                id: v.id
            }));
          } else {
            const count = this.course.lessonsCount || 15;
            this.dummyLessons.push({ title: 'مقدمة الكورس', duration: 2 as any, videoId: 'promo', id: 0 } as any);
            for (let i = 1; i <= count - 1; i++) {
              this.dummyLessons.push({ title: `الدرس ${i}`, duration: Math.floor(Math.random() * 15) + 5 as any, videoId: 'lesson'+i, id: i } as any);
            }
          }
          this.currentLessonIndex = 0; 
          this.maxLessonReached = -1;
          
          if (this.authService.isLoggedIn && this.course) {
            const savedState = this.courseService.getWatchingCourseState(this.course.slug);
            if (savedState) {
              this.maxLessonReached = savedState.maxLessonReached !== undefined ? savedState.maxLessonReached : -1;
              this.currentLessonIndex = this.maxLessonReached + 1;
              // Clamp it to not exceed lessons array
              if (this.currentLessonIndex >= this.dummyLessons.length) {
                this.currentLessonIndex = this.dummyLessons.length - 1;
              }
            }
          }
        }
      }
    });

    this.courseService.favoriteCourses$.subscribe(() => {
      this.checkFavoriteStatus();
    });
  }

  checkFavoriteStatus(): void {
    if (this.course) {
      this.isFavorite = this.courseService.isFavorite(this.course.slug);
    }
  }

  toggleFavorite(): void {
    if (this.course) {
      this.courseService.toggleFavorite(this.course);
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.updateSidebarPosition();
    }, 400);
  }




  updateSidebarPosition(): void {
    if (typeof window === 'undefined') return;
    
    // Clear styles for mobile screen viewports (width <= 990px)
    if (window.innerWidth <= 990) {
      this.sidebarStyle = {};
      return;
    }

    const wrapper = document.querySelector('.course_header_content_wrapper') as HTMLElement;
    const sidebar = document.querySelector('.course_sidebar') as HTMLElement;
    
    if (!wrapper || !sidebar) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const wrapperRect = wrapper.getBoundingClientRect();
    const wrapperTop = wrapperRect.top + scrollTop;
    const wrapperBottom = wrapperTop + wrapper.offsetHeight;

    // PIP video logic
    const videoContainer = document.querySelector('.course_header_video') as HTMLElement;
    if (videoContainer) {
      const videoRect = videoContainer.getBoundingClientRect();
      const videoTop = videoRect.top + scrollTop;
      const videoHeight = videoContainer.offsetHeight;
      
      // Trigger PIP when user scrolls past 20% of the video
      const triggerThreshold = videoTop + (videoHeight * 0.2);
      
      if (scrollTop > triggerThreshold) {
        if (!this.forceClosePiP) {
          this.isPiPActive = true;
        }
      } else {
        this.isPiPActive = false;
        this.forceClosePiP = false; // Reset when scrolling back up
      }
    }

    const sidebarHeight = sidebar.offsetHeight || 500;

    // Find footer element
    const footer = document.querySelector('app-footer') as HTMLElement;
    const footerTop = footer ? footer.getBoundingClientRect().top + scrollTop : document.documentElement.scrollHeight;

    // Scenario 1: Haven't scrolled past the sidebar top — keep it in natural flow
    if (scrollTop < wrapperTop) {
      this.sidebarStyle = {
        position: 'relative',
        top: 'auto',
        bottom: 'auto'
      };
    }
    // Scenario 2: Sidebar bottom would go past the footer — pin it absolute at the bottom
    else if (scrollTop + sidebarHeight > footerTop - 40) {
      this.sidebarStyle = {
        position: 'absolute',
        top: 'auto',
        bottom: '0px'
      };
    }
    // Scenario 3: Standard sticky behavior — fix it to the viewport top
    else {
      this.sidebarStyle = {
        position: 'fixed',
        top: '0px',
        bottom: 'auto'
      };
    }
  }

  playVideo(): void {
    if (this.authService.isLoggedIn && this.course) {
      const progress = Math.round(((this.maxLessonReached + 1) / this.dummyLessons.length) * 100);
      this.courseService.addWatching(this.course, progress, this.maxLessonReached, this.currentLessonIndex);
    }
  }

  changeLesson(index: number): void {
    if (index === 0 || this.isSubscribed) {
      if (index >= 0 && index < this.dummyLessons.length) {
        this.currentLessonIndex = index;
        if (index > this.maxLessonReached) {
          this.maxLessonReached = index;
        }
        if (this.authService.isLoggedIn && this.course) {
          const progress = Math.round(((this.maxLessonReached + 1) / this.dummyLessons.length) * 100);
          this.courseService.addWatching(this.course, progress, this.maxLessonReached, this.currentLessonIndex);
        }
      }
    } else {
      alert('تنبيه: باقي دروس هذا الكورس متاحة فقط للمشتركين. يرجى الاشتراك لمشاهدة جميع الدروس.');
    }
  }

  getLink(path: string): string {
    return this.countryService.link(path);
  }

  getInstructorSlug(name: string | undefined): string {
    if (!name) return '';
    return name.replace(/\s+/g, '');
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/assets/images/icons/default-avatar.svg';
  }

  stripHtml(html: string | undefined): string {
    if (!html) return '';
    let text = '';
    if (typeof document !== 'undefined') {
      const tmp = document.createElement('DIV');
      tmp.innerHTML = html;
      text = tmp.textContent || tmp.innerText || '';
    } else {
      // Basic regex fallback for SSR
      text = html.replace(/<[^>]*>?/gm, '');
    }
    
    // Truncate if it's too long
    if (text.length > 200) {
      text = text.substring(0, 200) + '...';
    }
    return text;
  }
}
