import { Component, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { EventsService } from './services/events.service';
import { Observable, Subject, debounceTime, distinctUntilChanged, shareReplay, switchMap, takeUntil } from 'rxjs';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnDestroy {
  searchValue: FormControl = new FormControl();
  events$: Observable<any>;
  limit: number = 10;
  page: number = 1;
  index: number = 0;
  destroy$ = new Subject();

  constructor(private eventService: EventsService) {
    this.events$ = this.eventService.getAllEvents(this.limit, this.page, this.searchValue?.value || ' ');
    this.searchValue.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      shareReplay(),
      switchMap((val: string) => this.events$ = this.eventService.getAllEvents(this.limit, this.page, val)),
      takeUntil(this.destroy$)
    ).subscribe()
  }

  goToPage(index: number) {
    this.index = index;
    this.page = index + 1;
    this.events$ = this.eventService.getAllEvents(this.limit, this.page, this.searchValue?.value || ' ');
  }

  trackByFn(item: any, index: number) {
    return item?._id
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
