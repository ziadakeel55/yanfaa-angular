import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { CourseService } from '../../core/services/course.service';
import { Course } from '../../core/models/course.model';
import { Model } from 'survey-core';
import { SurveyModule } from 'survey-angular-ui';
import 'survey-core/survey-core.min.css';

@Component({
  selector: 'app-certificate-troubleshooting',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, FooterComponent, SurveyModule],
  templateUrl: './troubleshoot.component.html',
  styleUrls: ['./troubleshoot.component.css']
})
export class TroubleshootComponent implements OnInit {
  courses: Course[] = [];
  surveyModel!: Model;

  constructor(private courseService: CourseService) {}

  ngOnInit() {
    // Only show courses the user is watching (viewed at least 1 video)
    this.courses = this.courseService.getWatchingCourses();

    const courseChoices = this.courses.map(c => ({
      value: c.slug,
      text: c.title
    }));

    const surveyJson = {
      title: "نموذج حل المشكلات واستكشاف الأخطاء",
      showProgressBar: "top",
      progressBarType: "questions",
      goNextPageAutomatic: false,
      showQuestionNumbers: "on",
      questionTitleLocation: "top",
      locale: "ar",
      pages: [
        {
          name: "page1",
          elements: [
            {
              type: "dropdown",
              name: "course",
              title: "من أي كورس تريد تقديم شكوى أو استفسار",
              isRequired: true,
              choices: courseChoices,
              placeholder: "اختر..."
            }
          ]
        },
        {
          name: "page2",
          elements: [
            {
              type: "radiogroup",
              name: "issueType",
              title: "ما هي مشكلتك؟",
              isRequired: true,
              choices: [
                { value: "certificate", text: "مشكلة في الشهادة" },
                { value: "video", text: "مشكلة في تشغيل الفيديوهات" },
                { value: "subscription", text: "مشكلة في الاشتراك" },
                { value: "payment", text: "مشكلة في الدفع" },
                { value: "other", text: "مشكلة أخرى" }
              ]
            }
          ]
        },
        {
          name: "page3",
          elements: [
            {
              type: "comment",
              name: "details",
              title: "برجاء كتابة تفاصيل المشكلة",
              isRequired: true,
              rows: 4
            }
          ]
        }
      ],
      completeText: "إرسال",
      pagePrevText: "السابق",
      pageNextText: "التالي",
      completedHtml: "<div style='text-align: center; padding: 40px;'><h3 style='color: #19b394; margin-bottom: 15px;'>تم إرسال طلبك بنجاح!</h3><p>سيتم التواصل معك في أقرب وقت ممكن</p></div>"
    };

    this.surveyModel = new Model(surveyJson);
  }
}
