import { Component, OnDestroy } from '@angular/core';
import { DashboardService } from './services/dashboard.service';
import { Observable, Subject, of, takeUntil } from 'rxjs';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnDestroy {
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin],
    height: '550px',
    headerToolbar: {
      left: 'prev,next',
      center: 'title',
      right: 'today'
    },
    weekends: true,
    editable: false,
    selectable: true,
    dayMaxEvents: 3,
    // displayEventEnd: true
  };
  limit: number = 100;
  offset: number = 0;
  dashboardStats: Observable<any> = of(null);
  destroy$ = new Subject();

  constructor(private dashboard: DashboardService) {
    this.dashboardStats = this.dashboard.getDashboardStatistics();
    this.dashboard.getCalendarEvents(this.limit, this.offset)
    .pipe(takeUntil(this.destroy$)).subscribe((val: any) => {
      this.calendarOptions.events = val?.events?.map((item: { title: string; startDate: number; endDate: number; eventStatus: string }) => {
        switch (item?.eventStatus) {
          case 'ongoing':
            return {
              title: item.title,
              start: item.startDate,
              end: item.endDate,
              backgroundColor: '#118B4E',
              borderColor: '#118B4E',
            }
          case 'upcoming':
            return {
              title: item.title,
              start: item.startDate,
              end: item.endDate,
              backgroundColor: '#f4c430',
              borderColor: '#f4c430',
            }
          case 'finished':
            return {
              title: item.title,
              start: item.startDate,
              end: item.endDate,
              backgroundColor: '#3B444B',
              borderColor: '#3B444B',
            }
          default:
            return {
              title: item.title,
              start: item.startDate,
              end: item.endDate,
              backgroundColor: '#3B444B',
              borderColor: '#3B444B',
            }
        }
      })
    })
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
