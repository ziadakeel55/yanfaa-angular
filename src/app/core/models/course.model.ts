/**
 * Course data model — mirrors the structure from the cloned site's <course-widget> component.
 */
export interface Course {
  id: string;
  slug: string;
  title: string;
  image: string;
  instructor: Instructor;
  duration: string;
  durationMinutes: number;
  category: string;
  categorySlug: string;
  isFree: boolean;
  price?: number;
  currency?: string;
  description?: string;
  lessonsCount?: number;
  viewCount?: number;
  rating?: number;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  videoId?: string;
  videoPoster?: string;
  progress?: number;
  maxLessonReached?: number;
  lastLessonIndex?: number;
  certificateUrl?: string;
  courseDetailsHtml?: string;
  relatedSlugs?: string[];
  instructorSocialHtml?: string;
  videos?: any[];
}

export interface Instructor {
  id?: string;
  slug?: string;
  name: string;
  avatar: string;
  bio?: string;
  title?: string;
  coursesCount?: number;
  socialHtml?: string;
}

export interface CourseListResponse {
  courses: Course[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface Certificate {
  title: string;
  image: string;
  pdfUrl: string;
}
