import { Component, Inject, OnDestroy } from '@angular/core';
import { EventsService } from '../events/services/events.service';
import { Subject, pluck, switchMap, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { EventModel } from 'src/@core/models/events.model';
import { TuiPdfViewerOptions, TuiPdfViewerService } from '@taiga-ui/kit';
import { DomSanitizer } from '@angular/platform-browser';
import {PolymorpheusContent} from '@tinkoff/ng-polymorpheus';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss']
})
export class EventDetailsComponent implements OnDestroy {
  activeItemIndex = 0;
  pdfFile: any;
  activeItemIndexDates = 0;
  index = 0;
  event: EventModel | any;
  food = 0;
  venue = 0;
  speaker = 0;
  overall = 0;
  comments = 'N/A';
  destroy$ = new Subject();
  agendaByDay: any = {};
  monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  constructor(private events: EventsService, private ac: ActivatedRoute,
    @Inject(TuiPdfViewerService) private readonly pdfService: TuiPdfViewerService,
    @Inject(DomSanitizer) private readonly sanitizer: DomSanitizer,) {
    this.ac.params.pipe(
      pluck('id'),
      switchMap((id: string) => this.events.getEventByID(id)),
      takeUntil(this.destroy$)
    ).subscribe((val: any) => {
      this.event = val;
      this.food = Number(this.event?.eventFeedback?.food) || 0;
      this.venue = Number(this.event?.eventFeedback?.venue) || 0;
      this.speaker = Number(this.event?.eventFeedback?.speaker) || 0;
      this.overall = Number(this.event?.eventFeedback?.overall) || 0;
      this.comments = this.event?.eventFeedback?.comments || 'N/A';
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

  showPDF(actions: PolymorpheusContent<TuiPdfViewerOptions>, pdf: any) {
    this.pdfService.open(this.sanitizer.bypassSecurityTrustResourceUrl(pdf),
    {
      label: 'Pakistan Endocrine Society Conference Manager',
      actions,
    }).subscribe()
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
