import { Component, Inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { EventsService } from './services/events.service';
import { Observable, Subject, Subscription, debounceTime, distinctUntilChanged, finalize, forkJoin, map, shareReplay, switchMap, takeUntil } from 'rxjs';
import { TuiDialogContext, TuiDialogService } from '@taiga-ui/core';
import { EventModel } from 'src/@core/models/events.model';
import {PolymorpheusContent} from '@tinkoff/ng-polymorpheus';
import { MediaUploadService } from 'src/@core/core-service/media-upload.service';
import { ApiResponse } from 'src/@core/models/core-response-model/response.model';
import { TuiDay, TuiTime } from '@taiga-ui/cdk';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnDestroy {
  searchValue: FormControl = new FormControl();
  events$: Observable<any>;
  limit: number = 8;
  page: number = 1;
  index: number = 0;
  destroy$ = new Subject();
  rating = 2;
  toggleExpand: boolean = true;
  eventForm!: FormGroup;
  readonly loadingFiles$ = new Subject<boolean>();
  multipleImages: any[] = [];
  uploadingMultiple = new Subject<boolean>();
  totalCount: number = 0;
  savingEvent = new Subject<boolean>();
  dialogSubs: Subscription[] = [];
  eventID: string | null = null;
  today: TuiDay

  constructor(
    private eventService: EventsService,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    private fb: FormBuilder,
    public media: MediaUploadService
  ) {
    this.initEventForm();
    this.events$ = this.eventService.getAllEvents(this.limit, this.page, this.searchValue?.value || ' ');
    let day = new Date().getDate()
    let month = new Date().getMonth()
    let year = new Date().getFullYear()
    this.today = new TuiDay(year, month, day)
    this.searchValue.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      shareReplay(),
      switchMap((val: string) => this.events$ = this.eventService.getAllEvents(this.limit, this.page, val)),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  initEventForm() {
    this.eventForm = this.fb.group({
      title: new FormControl(null, Validators.required),
      description: new FormControl(null, Validators.compose([
        Validators.required,
        Validators.maxLength(100)
      ])),
      startDate: new FormControl(null, Validators.required),
      endDate: new FormControl(null, Validators.required),
      featuredImage: new FormControl(null, Validators.required),
      gallery: new FormControl(undefined),
      streamUrl: new FormControl(null)
    })
  }

  get f() {
    return this.eventForm.controls;
  }

  goToPage(index: number): void {
    this.index = index;
    this.page = index + 1;
    this.events$ = this.eventService.getAllEvents(this.limit, this.page, this.searchValue?.value || ' ');
  }

  trackByFn(item: any, index: number): string {
    return item?._id
  }

  async fetchFileAndCreateFileObject(url: string) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const filename = url.substring(url.lastIndexOf("/") + 1);
      const file = new File([blob], filename, { type: blob.type });
      return file;
    } catch (error) {
      console.error("Error fetching and creating File object:", error);
      return null;
    }
  }

  showAddorEditDialog(content: PolymorpheusContent<TuiDialogContext>, data?: EventModel | any): void {
    if(data) {
      this.eventID = data?._id;
      this.f['title'].setValue(data?.title)
      this.f['description'].setValue(data?.description)
      this.f['streamUrl'].setValue(data?.streamUrl)
      this.f['featuredImage'].setValue(data?.featuredImage)
      this.multipleImages = data?.gallery[0]?.mediaUrl !== null ? data?.gallery[0]?.mediaUrl : []
      this.f['gallery'].setValue(data?.gallery[0]?.mediaUrl !== null ? data?.gallery[0]?.mediaUrl : undefined);
      let convertedStartDate = this.convertTimestampToObject(data?.startDate)
      let convertedEndDate = this.convertTimestampToObject(data?.endDate)
      this.f['startDate'].setValue([convertedStartDate?.Date, convertedStartDate?.Time])
      this.f['endDate'].setValue([convertedEndDate?.Date, convertedEndDate?.Time])
    }
    this.dialogSubs.push(this.dialogs.open(content, {
      dismissible: false,
      closeable: true,
      size: 'fullscreen'
    }).pipe(takeUntil(this.destroy$)).subscribe());
  }

  openDeleteDialog(content: PolymorpheusContent<TuiDialogContext>, id: string): void {
    this.eventID = id;
    this.dialogs.open(content, {
      dismissible: true,
      closeable: true,
    }).pipe(takeUntil(this.destroy$)).subscribe()
  }
  
  uploadFeaturedImage(event: any) {
    let file = event.target.files[0];
    if(file && ['image/jpg', 'image/jpeg', 'image/png', 'image/svg'].includes(file.type)) {
      this.loadingFiles$.next(true);
      return this.media.uploadMedia('test', file).pipe(
        map((res: ApiResponse<any>) => {
          if(!res.hasErrors()) {
            this.f['featuredImage']?.setValue(res.data?.url)
            return res.data?.url
          }
          return null;
        }),
        finalize(() => this.loadingFiles$.next(false))
      ).pipe(takeUntil(this.destroy$)).subscribe()
    }
    return null
  }

  uploadMultipleImages(event: any) {
    let files = event.target.files;
    if(files.length > 0) {
      this.uploadingMultiple.next(true);
      this.totalCount = files.length;
      let mediaUpload: Array<Observable<any>> = [];
      for (let i = 0; i < files.length; i++) {
        if(['image/jpg', 'image/jpeg', 'image/png', 'image/svg'].includes(files[i].type)) {
          mediaUpload.push(this.media.uploadMediaWithProgress('test', files[i], files.length));
        }
      }

      if(mediaUpload.length > 0) {
        forkJoin(mediaUpload).subscribe((values: any[]) => {
          for (const value of values) {
            this.multipleImages.push(value?.data?.url);
            this.f['gallery']?.setValue({mediaUrl: this.multipleImages})
          }
          this.uploadingMultiple.next(false);
        });
      }
    }
  }

  closeDialog() {
    this.dialogSubs.forEach(val => val.unsubscribe());
    this.eventForm.reset();
  }

  spliceImage(index: number, event: any) {
    event.preventDefault();
    event.stopImmediatePropagation();
    this.multipleImages.splice(index, 1);
    this.f['gallery']?.setValue({mediaUrl: this.multipleImages})
  }

  toggle() {
    this.toggleExpand = !this.toggleExpand
  }

  floorNumber(value: number) {
    return value >= this.limit ? Math.floor(value) : Math.ceil(value)
  }

  convertTimestampToObject(timestamp: number) {
    const dateObject = new Date(timestamp);

    const year = dateObject.getFullYear();
    const month = dateObject.getMonth();
    const day = dateObject.getDate();
    const hours = dateObject.getHours();
    const minutes = dateObject.getMinutes();
    const seconds = dateObject.getSeconds();
    const ms = dateObject.getMilliseconds();
  
    return {
      Date: new TuiDay(year, month, day),
      Time: new TuiTime(hours, minutes, seconds, ms)
    }
  }

  createEvent() {
    this.savingEvent.next(true)
    let startDate: [TuiDay, TuiTime] = this.f['startDate']?.value;
    let endDate: [TuiDay, TuiTime] = this.f['endDate']?.value;
    let today = new Date();
    const startDateTimestamp = new Date(
      startDate[0]?.year,
      startDate[0]?.month,
      startDate[0]?.day,
      startDate[1]?.hours ? startDate[1]?.hours : today.getHours(),
      startDate[1]?.minutes ? startDate[1]?.minutes : today.getMinutes(),
      startDate[1]?.seconds ? startDate[1]?.seconds : today.getSeconds(),
      startDate[1]?.ms ? startDate[1]?.ms : today.getMilliseconds()
    ).getTime();

    const endDateTimestamp = new Date(
      endDate[0]?.year,
      endDate[0]?.month,
      endDate[0]?.day,
      endDate[1]?.hours ? endDate[1]?.hours : today.getHours(),
      endDate[1]?.minutes ? endDate[1]?.minutes : today.getMinutes(),
      endDate[1]?.seconds ? endDate[1]?.seconds : today.getSeconds(),
      endDate[1]?.ms ? endDate[1]?.ms : today.getMilliseconds()
    ).getTime();
    const payload = Object.assign(this.eventForm.value, {startDate: startDateTimestamp}, {endDate: endDateTimestamp});
    this.eventService.createNewEvent(payload).pipe(takeUntil(this.destroy$)).subscribe(val => {
      if(val) {
        this.events$ = this.eventService.getAllEvents(this.limit, this.page, this.searchValue?.value || ' ');
        this.savingEvent.next(false);
        this.dialogSubs.forEach(val => val.unsubscribe());
        this.eventForm.reset();
      }
    })
  }

  updateEvent() {
    this.savingEvent.next(true)
    let startDate: [TuiDay, TuiTime] = this.f['startDate']?.value;
    let endDate: [TuiDay, TuiTime] = this.f['endDate']?.value;
    const startDateTimestamp = new Date(
      startDate[0]?.year,
      startDate[0]?.month,
      startDate[0]?.day,
      startDate[1]?.hours,
      startDate[1]?.minutes,
      startDate[1]?.seconds,
      startDate[1]?.ms
    ).getTime();

    const endDateTimestamp = new Date(
      endDate[0]?.year,
      endDate[0]?.month,
      endDate[0]?.day,
      endDate[1]?.hours,
      endDate[1]?.minutes,
      endDate[1]?.seconds,
      endDate[1]?.ms
    ).getTime();
    const payload = Object.assign(this.eventForm.value, {startDate: startDateTimestamp}, {endDate: endDateTimestamp});
    console.log(payload);
    this.eventService.updateEvent(payload, this.eventID).pipe(takeUntil(this.destroy$)).subscribe(val => {
      if(val) {
        this.events$ = this.eventService.getAllEvents(this.limit, this.page, this.searchValue?.value || ' ');
        this.savingEvent.next(false);
        this.dialogSubs.forEach(val => val.unsubscribe());
        this.eventForm.reset();
      }
    })
  }

  deleteEvent() {
    this.savingEvent.next(true)
    this.dialogSubs.push(this.eventService.deleteEvent(this.eventID)
    .pipe(takeUntil(this.destroy$))
    .subscribe(val => {
      if(val) {
        this.savingEvent.next(false);
        this.events$ = this.eventService.getAllEvents(this.limit, this.page, this.searchValue?.value || ' ');
      }
    }))
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
    this.dialogSubs.forEach(val => val.unsubscribe());
  }
}
