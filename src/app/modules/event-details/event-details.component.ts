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
  index = 0;
  event: EventModel | any;
  destroy$ = new Subject()

  constructor(private events: EventsService, private ac: ActivatedRoute) {
    this.ac.params.pipe(
      pluck('id'),
      switchMap((id: string) => this.events.getEventByID(id)),
      takeUntil(this.destroy$)
    ).subscribe((val: any) => {
      this.event = val;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
