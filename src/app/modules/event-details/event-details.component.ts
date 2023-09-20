import { Component, OnDestroy } from '@angular/core';
import { EventsService } from '../events/services/events.service';
import { Observable, Subject, pluck, switchMap, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { EventModel } from 'src/@core/models/events.model';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss']
})
export class EventDetailsComponent implements OnDestroy {
  activeItemIndex = 0;
  activeItemIndexDates = 0;
  index = 0;
  event: EventModel | any;
  destroy$ = new Subject();
  agendaByDay: any = {};
  monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  constructor(private events: EventsService, private ac: ActivatedRoute) {
    this.ac.params.pipe(
      pluck('id'),
      switchMap((id: string) => this.events.getEventByID(id)),
      takeUntil(this.destroy$)
    ).subscribe((val: any) => {
      this.event = val;
      this.mapAgendasByDays(val.agenda)
    });
  }

  mapAgendasByDays(agenda: any[]) {
    agenda.forEach((item: any) => {
      const date = new Date(item.day)
      const month = this.monthNames[date.getMonth()];
      const day = date.getDate();
      const formattedDate = `${month} ${day}`
      if (!this.agendaByDay[formattedDate]) {
        this.agendaByDay[formattedDate] = [];
      }
      this.agendaByDay[formattedDate].push(item);
    });
  }

  getObjectKeys(obj: any) {
    return Object.keys(obj)
  }

  getObjectValues(obj: any, index: any): any {
    let foundArray = null;
    let currentIndex = 0;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (currentIndex === index) {
          foundArray = obj[key];
          break;
        }
        currentIndex++;
      }
    }
    return foundArray;
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
