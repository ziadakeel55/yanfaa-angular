import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-counter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.css']
})
export class CounterComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('counterSection') counterSection!: ElementRef;

  private http = inject(HttpClient);

  counters = [
    { key: 'total_learners', target: 580012, current: 0, title: 'متعلم عربي', subtitle: 'من أنحاء العالم', suffix: '' },
    { key: 'total_courses', target: 400, current: 0, title: 'دورة تدريبية', subtitle: 'في مختلف المجالات', suffix: '+' },
    { key: 'total_certificates_issued', target: 281637, current: 0, title: 'شهادة', subtitle: 'تم اصدارها للمتعلمين', suffix: '' },
    { key: 'total_minutes_watched', target: 72856719, current: 0, title: 'دقيقة مشاهدة', subtitle: 'طبقًا لإحصائيات المنصة', suffix: '' }
  ];

  hasAnimated = false;
  liveSimulationInterval: any;

  ngOnInit(): void {
    this.fetchStats();
  }

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.hasAnimated) {
          this.hasAnimated = true;
          this.startAnimation();
        }
      });
    }, { threshold: 0.1 });

    if (this.counterSection) {
      observer.observe(this.counterSection.nativeElement);
    }
  }

  fetchStats(): void {
    this.http.get<any>('https://app.yanfaa.com/api/yanfaaStatistics').subscribe({
      next: (res) => {
        if (res) {
          const updateCounter = (key: string, value: number) => {
            const counter = this.counters.find(c => c.key === key);
            if (counter) {
              counter.target = value;
              // If already animated, update current directly
              if (this.hasAnimated) {
                counter.current = value;
              }
            }
          };

          updateCounter('total_learners', res.total_learners);
          updateCounter('total_courses', res.total_courses);
          updateCounter('total_certificates_issued', res.total_certificates_issued);
          updateCounter('total_minutes_watched', res.total_minutes_watched);
        }
      },
      error: (err) => {
        console.error('Error fetching yanfaa statistics:', err);
      }
    });
  }

  startAnimation(): void {
    const duration = 2000; // 2 seconds animation
    const steps = 60; // 60 frames
    const intervalTime = duration / steps;

    this.counters.forEach(counter => {
      let currentStep = 0;
      const increment = counter.target / steps;

      const interval = setInterval(() => {
        currentStep++;
        counter.current = Math.min(Math.floor(increment * currentStep), counter.target);

        if (currentStep >= steps || counter.current >= counter.target) {
          counter.current = counter.target;
          clearInterval(interval);
        }
      }, intervalTime);
    });

    // Start live simulation after initial animation finishes
    setTimeout(() => {
      this.startLiveSimulation();
    }, duration + 500);
  }

  startLiveSimulation(): void {
    // Simulate the websocket live updates by incrementing numbers continuously in a certain way
    this.liveSimulationInterval = setInterval(() => {
      // Increase minutes watched by a random number every 2 seconds
      const minutesCounter = this.counters.find(c => c.key === 'total_minutes_watched');
      if (minutesCounter) {
        minutesCounter.current += Math.floor(Math.random() * 50) + 10;
        minutesCounter.target = minutesCounter.current;
      }

      // Occasionally increase learners and certificates
      if (Math.random() > 0.8) {
        const learnersCounter = this.counters.find(c => c.key === 'total_learners');
        if (learnersCounter) {
          learnersCounter.current += 1;
          learnersCounter.target = learnersCounter.current;
        }
      }

      if (Math.random() > 0.9) {
        const certificatesCounter = this.counters.find(c => c.key === 'total_certificates_issued');
        if (certificatesCounter) {
          certificatesCounter.current += 1;
          certificatesCounter.target = certificatesCounter.current;
        }
      }
    }, 2000);
  }

  ngOnDestroy(): void {
    if (this.liveSimulationInterval) {
      clearInterval(this.liveSimulationInterval);
    }
  }
}
