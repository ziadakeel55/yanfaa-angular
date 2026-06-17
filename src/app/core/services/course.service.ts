import { Injectable } from '@angular/core';
import { Course, Instructor, Certificate } from '../models/course.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

// Import extracted data
import learningPathsData from '../../../assets/data/learning-paths.json';
import categoriesData from '../../../assets/data/categories.json';
import coursesData from '../../../assets/data/courses.json';
import instructorsData from '../../../assets/data/instructors.json';
import homeCoursesData from '../../../assets/data/home-courses.json';
import coursesExtraData from '../../../assets/data/courses-extra.json';
import pageLayoutsData from '../../../assets/data/page-layouts.json';

export interface LearningPath {
  slug: string;
  title: string;
  image: string;
  coursesCount: string;
  href: string;
  description?: string;
  courses?: Course[];
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private allCourses: Course[] = [];

  private categoriesMap: Record<string, string> = {};

  private favoriteCoursesSubject = new BehaviorSubject<Course[]>([]);
  public favoriteCourses$ = this.favoriteCoursesSubject.asObservable();

  private watchingCoursesSubject = new BehaviorSubject<Course[]>([]);
  public watchingCourses$ = this.watchingCoursesSubject.asObservable();

  private userCertificatesSubject = new BehaviorSubject<Certificate[]>([]);
  public userCertificates$ = this.userCertificatesSubject.asObservable();

  private authService = inject(AuthService);
  private currentUserEmail: string | null = null;

  constructor() {
    // Build a category lookup map: courseSlug -> categorySlug
    const courseCategoryLookup: Record<string, string> = {};
    for (const [catSlug, catObj] of Object.entries(categoriesData as any)) {
      if ((catObj as any).title) {
        this.categoriesMap[catSlug] = (catObj as any).title;
      }
      const coursesInCat = (catObj as any).courses || [];
      for (const c of coursesInCat) {
        courseCategoryLookup[c] = catSlug;
      }
    }

    // Map raw courses data to full Course objects
    this.allCourses = (coursesData as any[]).map(c => {
      const catSlug = c.categorySlug || courseCategoryLookup[c.slug] || '';
      const instName = c.instructor?.name || '';
      const instSlug = c.instructor?.slug || '';
      const instBio = instSlug ? ((instructorsData as any)[instSlug]?.bio || '') : '';

      let cleanImg = c.image ? (c.image.startsWith('/') || c.image.startsWith('http') ? c.image : '/' + c.image) : '';
      if (cleanImg && !cleanImg.startsWith('/assets/')) {
         cleanImg = '/assets/' + cleanImg;
      }

      let rawAvatar = instSlug ? ((instructorsData as any)[instSlug]?.avatar || c.instructor?.avatar) : c.instructor?.avatar;
      let cleanAvatar = rawAvatar ? (rawAvatar.startsWith('/') || rawAvatar.startsWith('http') ? rawAvatar : '/' + rawAvatar) : '';

      const extra = (coursesExtraData as any)[c.slug] || {};

      return {
        id: c.slug,
        slug: c.slug,
        title: c.title || c.slug.replace(/_/g, ' ').replace(/-/g, ' '),
        image: cleanImg,
        instructor: {
          name: instName,
          avatar: cleanAvatar,
          slug: instSlug,
          bio: extra.instructorBio || instBio,
          title: extra.instructorTitle || ''
        },
        duration: extra.duration || c.duration || '',
        durationMinutes: 0,
        category: this.categoriesMap[catSlug] || catSlug,
        categorySlug: catSlug,
        isFree: !!c.isFree,
        description: c.description || '',
        lessonsCount: extra.lessonsCount || c.lessonsCount || 0,
        videoId: extra.videoId || '',
        videoPoster: extra.videoPoster || '',
        courseDetailsHtml: extra.courseDetailsHtml || '',
        relatedSlugs: extra.relatedSlugs || [],
        instructorSocialHtml: extra.instructorSocialHtml || '',
        videos: c.videos || []
      };
    });

    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUserEmail = user.email;
        this.loadUserData();
      } else {
        this.currentUserEmail = null;
        this.favoriteCoursesSubject.next([]);
        this.watchingCoursesSubject.next([]);
        this.userCertificatesSubject.next([]);
      }
    });
  }

  // ─── Course Methods ──────────────────────────────────────────────
  getAllCourses(): Course[] {
    return this.allCourses;
  }

  initializeFavorites(courses: Course[]) {
    this.favoriteCoursesSubject.next(courses);
  }

  initializeWatching(courses: Course[]) {
    this.watchingCoursesSubject.next(courses);
  }

  private loadUserData() {
    if (!this.currentUserEmail || typeof window === 'undefined') return;
    const key = `yanfaa_data_${this.currentUserEmail}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        const favSlugs = data.favorites || [];
        const watchSlugs = data.watching || [];
        
        const favs = favSlugs.map((s: string) => this.getCourseBySlug(s));
        const watch = watchSlugs.map((item: any) => {
          if (typeof item === 'string') {
            const c = this.getCourseBySlug(item);
            if (c) {
              c.progress = 0;
              c.maxLessonReached = -1;
              c.lastLessonIndex = 0;
            }
            return c;
          } else if (item && item.slug) {
            const c = this.getCourseBySlug(item.slug);
            if (c) {
              c.progress = item.progress || 0;
              c.maxLessonReached = item.maxLessonReached !== undefined ? item.maxLessonReached : -1;
              c.lastLessonIndex = item.lastLessonIndex || 0;
              c.certificateUrl = item.certificateUrl || undefined;
            }
            return c;
          }
          return null;
        }).filter((c: any) => !!c);
        
        this.favoriteCoursesSubject.next(favs);
        this.watchingCoursesSubject.next(watch);
      } catch (e) {
        console.error('Failed to load user data', e);
      }
    }

    this.updateCertificates();
  }

  private async updateCertificates() {
    const currentWatching = this.watchingCoursesSubject.getValue();
    const certs: Certificate[] = [];
    let updated = false;

    for (let c of currentWatching) {
      const totalLessons = c.lessonsCount || 15;
      const maxReached = c.maxLessonReached !== undefined ? c.maxLessonReached : -1;
      
      // If user reached the last lesson (0-indexed) or further, they finished the course
      if (maxReached >= totalLessons - 1) {
        // Fix existing relative certificate URLs
        if (c.certificateUrl && c.certificateUrl.startsWith('/certificates')) {
          c.certificateUrl = `${environment.streamBaseUrl}${c.certificateUrl}`;
          updated = true;
        }

        // If certificate doesn't exist, generate it
        if (!c.certificateUrl) {
          try {
            const user = this.authService.currentUser;
            const username = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'مستخدم ينفع';
            
            const response = await fetch(`${environment.streamBaseUrl}/api/generate_certificate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                username: username,
                coursename: c.title,
                dateofissue: new Date().toISOString().split('T')[0],
                classlength: `${c.durationMinutes || 120} دقيقة`,
                founder_ceo: c.instructor?.name || 'محمد المفتي',
                domain: window.location.origin
              })
            });
            
            const result = await response.json();
            if (result.success) {
              c.certificateUrl = result.url;
              updated = true;
            }
          } catch (e) {
            console.error('Failed to generate certificate', e);
          }
        }
        
        certs.push({
          title: c.title,
          image: c.image,
          pdfUrl: c.certificateUrl || '#'
        });
      }
    }

    if (updated) {
      this.watchingCoursesSubject.next([...currentWatching]);
      this.saveUserData();
    }
    
    this.userCertificatesSubject.next(certs);
  }

  private saveUserData() {
    if (!this.currentUserEmail || typeof window === 'undefined') return;
    const key = `yanfaa_data_${this.currentUserEmail}`;
    const favSlugs = this.favoriteCoursesSubject.getValue().map(c => c.slug);
    const watchData = this.watchingCoursesSubject.getValue().map(c => ({ 
      slug: c.slug, 
      progress: c.progress || 0,
      maxLessonReached: c.maxLessonReached !== undefined ? c.maxLessonReached : -1,
      lastLessonIndex: c.lastLessonIndex || 0,
      certificateUrl: c.certificateUrl
    }));
    
    localStorage.setItem(key, JSON.stringify({
      favorites: favSlugs,
      watching: watchData
    }));
  }

  toggleFavorite(course: Course) {
    const currentFavs = this.favoriteCoursesSubject.getValue();
    const index = currentFavs.findIndex(c => c.slug === course.slug);
    if (index >= 0) {
      const newFavs = [...currentFavs];
      newFavs.splice(index, 1);
      this.favoriteCoursesSubject.next(newFavs);
    } else {
      this.favoriteCoursesSubject.next([...currentFavs, course]);
    }
    this.saveUserData();
  }

  addWatching(course: Course, progress: number = 0, maxLessonReached: number = -1, lastLessonIndex: number = 0) {
    const currentWatching = this.watchingCoursesSubject.getValue();
    const existingIndex = currentWatching.findIndex(c => c.slug === course.slug);
    
    const updatedCourse = { ...course, progress, maxLessonReached, lastLessonIndex };

    if (existingIndex >= 0) {
      // Move to top and update progress
      const newWatching = [...currentWatching];
      newWatching.splice(existingIndex, 1);
      this.watchingCoursesSubject.next([updatedCourse, ...newWatching]);
      this.saveUserData();
      this.updateCertificates();
    } else {
      this.watchingCoursesSubject.next([updatedCourse, ...currentWatching]);
      this.saveUserData();
      this.updateCertificates();
    }
  }

  getWatchingCourseState(slug: string): Course | undefined {
    const currentWatching = this.watchingCoursesSubject.getValue();
    return currentWatching.find(c => c.slug === slug);
  }

  getWatchingCourses(): Course[] {
    return this.watchingCoursesSubject.getValue();
  }

  removeWatching(courseSlug: string) {
    const currentWatching = this.watchingCoursesSubject.getValue();
    const index = currentWatching.findIndex(c => c.slug === courseSlug);
    if (index >= 0) {
      const newWatching = [...currentWatching];
      newWatching.splice(index, 1);
      this.watchingCoursesSubject.next(newWatching);
      this.saveUserData();
    }
  }

  isFavorite(slug: string): boolean {
    return this.favoriteCoursesSubject.getValue().some(c => c.slug === slug);
  }

  getPopularCourses(pageKey: string = 'home'): Course[] {
    const layout = (pageLayoutsData as any)[pageKey];
    if (layout && layout.popular) {
      return layout.popular.map((slug: string) => this.getCourseBySlug(slug));
    }
    // Fallback to old behavior if not found
    return (homeCoursesData.popular as string[]).map(slug => this.getCourseBySlug(slug));
  }

  getRecentCourses(pageKey: string = 'home'): Course[] {
    const layout = (pageLayoutsData as any)[pageKey];
    let courses: Course[] = [];
    let layoutSlugs = new Set<string>();

    if (layout && layout.recent) {
      courses = layout.recent.map((slug: string) => this.getCourseBySlug(slug));
      layout.recent.forEach((s: string) => layoutSlugs.add(s));
    } else {
      // Fallback
      courses = (homeCoursesData.recent as string[]).map(slug => this.getCourseBySlug(slug));
      (homeCoursesData.recent as string[]).forEach(s => layoutSlugs.add(s));
    }

    // Append the rest of the courses for this category so the "Load More" button has data
    if (pageKey !== 'home') {
      const allCatCourses = this.getCoursesByCategory(pageKey);
      const rest = allCatCourses.filter(c => !layoutSlugs.has(c.slug));
      courses = [...courses, ...rest];
    } else {
      const allCourses = this.getAllCourses();
      const rest = allCourses.filter(c => !layoutSlugs.has(c.slug));
      courses = [...courses, ...rest];
    }

    return courses;
  }

  getCoursesByCategory(categorySlug: string): Course[] {
    const catObj = (categoriesData as any)[categorySlug];
    if (catObj && catObj.courses) {
      return (catObj.courses as string[]).map(slug => this.getCourseBySlug(slug));
    }
    
    // Fallback: search through all courses if category wasn't in categoriesData (e.g. subcategories)
    return this.getAllCourses().filter(c => c.categorySlug === categorySlug);
  }

  getCourseBySlug(slug: string): Course {
    let course = this.getAllCourses().find(c => c.slug === slug);
    if (!course) {
      try {
        const decoded = decodeURIComponent(slug);
        course = this.getAllCourses().find(c => c.slug === decoded);
      } catch (e) {
        // ignore decode errors
      }
    }
    if (course) return course;

    // Dynamic fallback
    const extra = (coursesExtraData as any)[slug] || {};
    return {
      id: slug,
      slug: slug,
      title: extra.title || slug.replace(/_/g, ' ').replace(/-/g, ' '),
      image: '/images/intro.ae56c89d0f7607ed797f.png',
      instructor: {
        name: 'Mohamed El Mufty',
        avatar: extra.instructorAvatar || '//assets/images/icons/default-avatar.svg',
        bio: extra.instructorBio || '',
        title: extra.instructorTitle || ''
      },
      duration: extra.duration || 'ساعتين',
      durationMinutes: 120,
      category: 'الرسم والتصميم',
      categorySlug: 'Design',
      isFree: false,
      lessonsCount: extra.lessonsCount || 10,
      description: extra.description || 'تفاصيل هذا الكورس ودروسه ستكون متاحة قريبًا. يمكنك الآن الاشتراك والاستفادة منه ومن مئات الكورسات الأخرى.',
      videoId: extra.videoId || '',
      videoPoster: extra.videoPoster || '',
      courseDetailsHtml: extra.courseDetailsHtml || '',
      relatedSlugs: extra.relatedSlugs || [],
      instructorSocialHtml: extra.instructorSocialHtml || '',
      videos: []
    };
  }

  // ─── Learning Path Methods ───────────────────────────────────────
  getAllLearningPaths(): LearningPath[] {
    return (learningPathsData as any[]).map(lp => ({
      slug: lp.slug,
      title: lp.title,
      image: lp.image ? (lp.image.startsWith('/') || lp.image.startsWith('http') ? lp.image : '/' + lp.image) : '',
      coursesCount: lp.coursesCount,
      href: lp.href,
      description: lp.description || ''
    }));
  }

  getLearningPathBySlug(slug: string): LearningPath {
    const found = (learningPathsData as any[]).find(lp => lp.slug === slug);
    if (!found) {
      return {
        slug: slug,
        title: 'مسار التعلم',
        image: '',
        coursesCount: '',
        href: '',
        description: '',
        courses: []
      };
    }

    const pathCourses: Course[] = (found.courses || []).map((cSlug: string) => {
      const fullCourse = this.allCourses.find(c => c.slug === cSlug);
      if (fullCourse) return fullCourse;
      return this.getCourseBySlug(cSlug);
    });

    return {
      slug: found.slug,
      title: found.title,
      image: found.image ? (found.image.startsWith('/') || found.image.startsWith('http') ? found.image : '/' + found.image) : '',
      coursesCount: found.coursesCount,
      href: found.href,
      description: found.description || '',
      courses: pathCourses
    };
  }

  getCategoryName(slug: string): string {
    return this.categoriesMap[slug] || slug;
  }

  // ─── Instructor Methods ──────────────────────────────────────────
  getInstructorBySlug(slug: string): Instructor | null {
    let instructor = (instructorsData as any)[slug];
    if (!instructor) {
      const lowerSlug = slug.toLowerCase();
      for (const [key, val] of Object.entries(instructorsData as any)) {
        if (key.toLowerCase() === lowerSlug) {
          instructor = val;
          break;
        }
      }
    }
    if (!instructor) return null;
    
    const cleanAvatar = instructor.avatar ? (instructor.avatar.startsWith('/') || instructor.avatar.startsWith('http') ? instructor.avatar : '/' + instructor.avatar) : '';
    return {
      slug: instructor.slug,
      name: instructor.name,
      avatar: cleanAvatar,
      bio: instructor.bio || '',
      title: instructor.title || '',
      socialHtml: instructor.socialHtml || ''
    };
  }

  getInstructorCourses(instructorName: string): Course[] {
    if (!instructorName) return [];
    const lowerName = instructorName.trim().toLowerCase();
    
    // Check instructorsData first for ordered list of courses
    let instSlug = '';
    for (const [slug, instObj] of Object.entries(instructorsData as any)) {
      if ((instObj as any).name?.trim().toLowerCase() === lowerName) {
        instSlug = slug;
        break;
      }
    }
    
    if (instSlug) {
      const instObj = (instructorsData as any)[instSlug];
      if (instObj && instObj.courses && instObj.courses.length > 0) {
        return (instObj.courses as string[]).map(slug => {
          const fullCourse = this.allCourses.find(c => c.slug === slug);
          if (fullCourse) return fullCourse;
          return this.getCourseBySlug(slug);
        });
      }
    }

    // Fallback: filter by name
    return this.allCourses.filter(c => c.instructor?.name?.trim().toLowerCase() === lowerName);
  }
}
