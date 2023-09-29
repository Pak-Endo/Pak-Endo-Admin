import { Component, ElementRef, Inject, OnDestroy, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { EventsService } from './services/events.service';
import { Observable, Subject, Subscription, debounceTime, distinctUntilChanged, finalize, forkJoin, map, shareReplay, switchMap, take, takeUntil } from 'rxjs';
import { TuiDialogContext, TuiDialogService } from '@taiga-ui/core';
import { EventModel } from 'src/@core/models/events.model';
import {PolymorpheusContent} from '@tinkoff/ng-polymorpheus';
import { MediaUploadService } from 'src/@core/core-service/media-upload.service';
import { ApiResponse } from 'src/@core/models/core-response-model/response.model';
import { TuiContextWithImplicit, TuiDay, TuiDayRange, TuiStringHandler, TuiTime, tuiPure } from '@taiga-ui/cdk';
import {TuiCountryIsoCode} from '@taiga-ui/i18n';
import {tuiInputTimeOptionsProvider} from '@taiga-ui/kit';
import { PagesService } from '../pages/pages.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
  providers: [
    tuiInputTimeOptionsProvider({
      mode: 'HH:MM',
      maxValues: {HH: 11, MM: 59, SS: 59, MS: 999}
    }),
  ],
})
export class EventsComponent implements OnDestroy {
  searchValue: FormControl = new FormControl();
  open = false;
  events$: Observable<any>;
  limit: number = 8;
  page: number = 1;
  index: number = 0;
  destroy$ = new Subject();
  toggleExpand: boolean = true;
  eventForm!: FormGroup;
  filterForm!: FormGroup;
  readonly loadingFiles$ = new Subject<boolean>();
  multipleImages: any[] = [];
  attachments: any[] = [];
  uploadingMultiple = new Subject<boolean>();
  totalCount: number = 0;
  savingEvent = new Subject<boolean>();
  dialogSubs: Subscription[] = [];
  eventID: string | null = null;
  today: TuiDay
  tomorrow: TuiDay;
  activeIndex: number = 0;
  eventTypes = ['Conference', 'Workshop', 'Corporate Symposium'];
  daysOfEvents: any = [];
  daysOfEventsValue: any = [];
  readonly countries: readonly TuiCountryIsoCode[] = [
    TuiCountryIsoCode.PK,
    TuiCountryIsoCode.US,
    TuiCountryIsoCode.GB,
    TuiCountryIsoCode.FR
  ];
  countryIsoCode = TuiCountryIsoCode.PK;
  savingMember = new Subject<boolean>();
  isFilterActive = new Subject<boolean>();
  @ViewChild('agendaDiv') agendaDiv!: ElementRef;
  items = [
    'upcoming',
    'ongoing',
    'finished'
  ];
  venues: any[] = [];
  sponsors: any[] = [];
  sponsorsForDisplay: any[] = [];
  venueValue: any;
  sponsorValue: any;

  constructor(
    private eventService: EventsService,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    private fb: FormBuilder,
    public media: MediaUploadService,
    private pageService: PagesService,
    private router: Router
  ) {
    this.initFilterForm();
    this.pageService.getAllVenues(1000, 1).pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.venues = value?.data?.data?.map((venues: any) => {
        return {
          id: venues._id,
          name: venues.venueName + ', ' + venues.city
        }
      })
    });
    this.pageService.getAllSponsors(1000, 1).pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.sponsors = value?.data?.data?.map((sponsors: any) => {
        return {
          id: sponsors._id,
          name: sponsors.sponsorName,
          logo: sponsors.sponsorLogo,
          contact: sponsors.contact
        }
      });
      this.sponsorsForDisplay = value?.data?.data?.map((val: any) => val.sponsorName)
    })
    let day = new Date().getDate()
    let nextDay = new Date().getDate() + 1
    let month = new Date().getMonth()
    let year = new Date().getFullYear()
    this.today = new TuiDay(year, month, day);
    this.tomorrow = new TuiDay(year, month, nextDay)
    this.initEventForm();
    this.events$ = this.eventService.getAllEvents(this.limit, this.page, {title: this.searchValue?.value || null});
    this.searchValue.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      shareReplay(),
      switchMap((val: string) => this.events$ = this.eventService.getAllEvents(this.limit, this.page, {title: val})),
      takeUntil(this.destroy$)
    ).subscribe();
    this.setNoOfDaysForAgenda();
  }

  @tuiPure
    stringify(items: readonly any[]): TuiStringHandler<TuiContextWithImplicit<any>> {
      const map = new Map(items.map(({id, name}) => [id, name] as [string, string]));
      return ({$implicit}: TuiContextWithImplicit<string>) => map.get($implicit) || '';
    }

  initEventForm() {
    this.eventForm = this.fb.group({
      title: new FormControl(null, Validators.required),
      description: new FormControl(null, Validators.compose([
        Validators.required,
        Validators.maxLength(500)
      ])),
      eventDays: new FormControl(
        null,
        Validators.required
      ),
      location: new FormControl(null, Validators.required),
      openForPublic: new FormControl(true),
      featuredImage: new FormControl(null, Validators.required),
      gallery: new FormControl(undefined),
      type: new FormControl(null, Validators.required),
      grandSponsor: new FormControl([], Validators.required),
      fees: new FormArray([
        new FormGroup({
          feeType: new FormControl(null, Validators.required),
          feeValue: new FormControl(null, Validators.required)
        })
      ])
    })
  }

  initFilterForm() {
    this.filterForm = this.fb.group({
      location: new FormControl(null),
      type: new FormControl(null),
      startDate: new FormControl(null),
      endDate: new FormControl(null),
      speaker: new FormControl(null),
      status: new FormControl(null)
    })
  }

  filterToggleStatus(event: any) {
    this.filterForm?.get('status')?.reset();
    this.filterForm?.get('status')?.setValue(event);
  }

  get f() {
    return this.eventForm.controls;
  }

  get fees() {
    return this.f['fees'] as FormArray
  }

  addFees() {
    const fee = this.fb.group({
      feeType: [null, Validators.required],
      feeValue: [null, Validators.required]
    })
    this.fees.push(fee)
  }

  removeFees(index: number) {
    this.fees.removeAt(index)
  }

  setNoOfDaysForAgenda() {
    this?.f['eventDays']?.valueChanges
    ?.pipe(takeUntil(this.destroy$))?.subscribe(val => {
      this.daysOfEventsValue = [{...val?.from}, {...val?.to}];
    })
  }

  goToPage(index: number): void {
    this.index = index;
    this.page = index + 1;
    let payload = {...this.filterForm.value};
    if(payload.startDate) {
      let startDateTimestamp = this.convertDateObjToTimestmp(payload.startDate);
      payload = {...payload, startDate: startDateTimestamp}
    }
    if(payload.endDate) {
      let endDateTimestamp = this.convertDateObjToTimestmp(payload.endDate)
      payload = {...payload, endDate: endDateTimestamp}
    }
    if(payload.status) {
      let newStatus = this.filterForm?.get('status')?.value?.map((val: any) => val).join('')
      payload = {...payload, status: newStatus}
    }
    if(this.searchValue?.value) {
      payload = {...payload, title: this.searchValue?.value }
    }
    debugger
    this.events$ = this.eventService.getAllEvents(this.limit, this.page, payload);
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
      this.fees.clear();
      this.eventID = data?._id;
      this.f['title'].setValue(data?.title)
      data?.fees?.map((val: any) => {
        let feeForm = this.fb.group({
          feeType: [val.feeType],
          feeValue: [val.feeValue],
        })
        this.fees.push(feeForm)
      })
      this.f['description'].setValue(data?.description)
      this.f['featuredImage'].setValue(data?.featuredImage)
      this.f['type'].setValue(data?.type)
      this.f['location'].setValue(data?.location?.name)
      this.venueValue = data?.location?.id;
      this.f['grandSponsor'].setValue(data?.grandSponsor?.map((val: any) => val.name));
      this.f['openForPublic']?.setValue(data?.openForPublic || true)
      this.multipleImages = data?.gallery[0]?.mediaUrl !== null ? data?.gallery[0]?.mediaUrl : []
      this.f['gallery'].setValue(data?.gallery[0]?.mediaUrl !== null ? data?.gallery[0]?.mediaUrl : undefined);
      let convertedStartDate = this.convertTimestampToObject(data?.startDate)
      let convertedEndDate = this.convertTimestampToObject(data?.endDate)
      let eventDayRange: TuiDayRange = new TuiDayRange(convertedStartDate?.Date, convertedEndDate?.Date);
      this.f['eventDays'].setValue(eventDayRange)
      // data.agenda.map((agenda: any) => {
      //   agenda.day = this.convertTimestampToObject(agenda.day)?.Date
      //   agenda.from = this.convertTimeStringToObject(agenda.from)
      //   agenda.to = this.convertTimeStringToObject(agenda.to)
      //   agendaDays.push({...agenda.day})
        // let formAgenda = this.fb.group({
        //   _id: [agenda._id],
        //   agendaTitle: [agenda.agendaTitle, Validators.required],
        //   day: [agenda.day, Validators.required],
        //   from: [agenda.from, Validators.required],
        //   to: [agenda.to, Validators.required],
        //   venue: [agenda.venue, Validators.required],
        //   speaker: [agenda.speaker || null],
        //   streamUrl: [agenda.streamUrl || null],
        //   speakerImg: [agenda.speakerImg || null],
        //   attachments: [agenda.attachments || []]
        // });
        // this.agendas.push(formAgenda)
        // this.agendas.updateValueAndValidity();
      // });
      // agendaDays = [...new Map(agendaDays?.map((data: any) => [data['day'], data])).values()]
      // this.daysOfEvents = agendaDays;
    }
    this.dialogSubs.push(this.dialogs.open(content, {
      dismissible: false,
      closeable: false,
      size: 'l'
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

  uploadAttachments(event: any, index: number) {
    let files = event.target.files;
    if(files.length > 0) {
      this.uploadingMultiple.next(true);
      this.totalCount = files.length;
      let mediaUpload: Array<Observable<any>> = [];
      for (let i = 0; i < files.length; i++) {
        mediaUpload.push(this.media.uploadMediaWithProgress('test', files[i], files.length));
      }

      if(mediaUpload.length > 0) {
        forkJoin(mediaUpload).subscribe((values: any[]) => {
          for (const value of values) {
            this.attachments.push(value?.data);
          }
          this.uploadingMultiple.next(false);
        });
      }
    }
  }

  checkFileType(value: any) {
    if(value.includes('image')) {
      return 'image'
    }
    if(value.includes('audio')) {
      return 'audio'
    }
    return 'video'
  }

  closeDialog(event: any) {
    event.preventDefault();
    event.stopPropagation();
    this.eventID = null;
    this.dialogSubs.forEach(val => val.unsubscribe());
    this.eventForm.reset();
    this.activeIndex = 0;
    this.eventID = null;
  }

  spliceImage(index: number, event: any) {
    event.preventDefault();
    event.stopImmediatePropagation();
    this.multipleImages.splice(index, 1);
    this.f['gallery']?.setValue({mediaUrl: this.multipleImages})
  }

  spliceAttachment(index: number, event: any) {
    event.preventDefault();
    event.stopImmediatePropagation();
    this.attachments.splice(index, 1);
  }

  toggle() {
    this.toggleExpand = !this.toggleExpand
  }

  floorNumber(value: number) {
    return Math.ceil(value)
  }

  convertTimestampToObject(timestamp: number) {
    if(typeof timestamp != 'object') {
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
    return timestamp
  }

  convertTimeStringToObject(timeString: string) {
    if(typeof timeString == 'string') {
      const [hours, minutes] = timeString.split(':').map(Number)
      let time: TuiTime = new TuiTime(hours, minutes)
      return time
    }
    return timeString
  }

  convertDateObjToTimestmp(date: any) {
    const dateTimeStamp = new Date(
      date?.year,
      date?.month,
      date?.day,
      23,
      59,
      59,
      0
    ).getTime();
    return dateTimeStamp
  }

  mapAndGetMonths(value: number) {
    let months = new Map([
      [0, 'January'],
      [1, 'February'],
      [2, 'March'],
      [3, 'April'],
      [4, 'May'],
      [5, 'June'],
      [6, 'July'],
      [7, 'August'],
      [8, 'September'],
      [9, 'October'],
      [10, 'November'],
      [11, 'December']
    ])
    if(months.has(value)) {
      return months.get(value)
    }
    return null
  }

  validateStepOne() {
    return (
      this.f['title']?.valid &&
      this.f['description']?.valid &&
      this.f['eventDays']?.valid &&
      this.f['featuredImage']?.valid &&
      this.f['location']?.valid &&
      this.f['type']?.valid
    )
  }

  createEvent() {
    this.savingEvent.next(true)
    let startDate: TuiDay = this.f['eventDays']?.value?.from;
    let endDate: TuiDay = this.f['eventDays']?.value?.to;
    const startDateTimestamp = new Date(
      startDate?.year,
      startDate?.month,
      startDate?.day,
      23,
      59,
      59,
      0
    ).getTime();
    const endDateTimestamp = new Date(
      endDate?.year,
      endDate?.month,
      endDate?.day,
      23,
      59,
      59,
      0
    ).getTime();
    const payload = Object.assign(
      this.eventForm.value,
      {startDate: startDateTimestamp},
      {endDate: endDateTimestamp},
      {grandSponsor: this.sponsors?.filter(value => this.f['grandSponsor']?.value.includes(value.name))},
      {location: this.venues?.filter(value => value?.id == this.f['location']?.value)[0]},
      {gallery: this.f['gallery']?.value ? this.f['gallery']?.value: undefined},
      {agenda: []},
      {rating: 0}
    );
    delete payload.eventDays
    delete payload.agendas
    this.eventService.createNewEvent(payload).pipe(takeUntil(this.destroy$)).subscribe((val: any) => {
      if(val) {
        this.events$ = this.eventService.getAllEvents(this.limit, this.page, this.searchValue?.value || ' ');
        this.savingEvent.next(false);
        this.dialogSubs.forEach(val => val.unsubscribe());
        this.activeIndex = 0;
        this.eventForm.reset();
        this.router.navigate(['/agendas', val?.id])
        this.eventID = null;
      }
    })
  }

  updateEvent() {
    this.savingEvent.next(true)
    let startDate: TuiDay = this.f['eventDays']?.value?.from;
    let endDate: TuiDay = this.f['eventDays']?.value?.to;
    const startDateTimestamp = new Date(
      startDate?.year,
      startDate?.month,
      startDate?.day,
      23,
      59,
      59,
      0
    ).getTime();
    const endDateTimestamp = new Date(
      endDate?.year,
      endDate?.month,
      endDate?.day,
      23,
      59,
      59,
      0
    ).getTime();
    const payload = Object.assign(
      this.eventForm.value,
      {startDate: startDateTimestamp},
      {endDate: endDateTimestamp},
      {grandSponsor: this.sponsors?.filter(value => this.f['grandSponsor']?.value.includes(value.name))},
      {location: this.venues?.filter(value => value?.id == this.f['location']?.value)[0]},
      {gallery: this.f['gallery']?.value ? this.f['gallery']?.value: undefined}
    );
    delete payload.eventDays
    delete payload.agendas
    this.eventService.updateEvent(payload, this.eventID).pipe(takeUntil(this.destroy$)).subscribe(val => {
      if(val) {
        this.events$ = this.eventService.getAllEvents(this.limit, this.page, this.searchValue?.value || ' ');
        this.savingEvent.next(false);
        this.dialogSubs.forEach(val => val.unsubscribe());
        this.activeIndex = 0;
        this.eventForm.reset();
        this.eventID = null
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
        this.eventID = null;
      }
    }))
  }

  checkIfFilterFormHasValue() {
    return !(this.filterForm.get('location')?.value ||
    this.filterForm.get('speaker')?.value ||
    this.filterForm.get('endDate')?.value ||
    this.filterForm.get('startDate')?.value ||
    this.filterForm.get('type')?.value ||
    this.filterForm.get('status')?.value)
  }

  applyAdvancedFilters() {
    this.isFilterActive.next(true);
    let payload = {...this.filterForm.value};
    if(payload.startDate) {
      let startDateTimestamp = this.convertDateObjToTimestmp(payload.startDate);
      payload = {...payload, startDate: startDateTimestamp}
    }
    if(payload.endDate) {
      let endDateTimestamp = this.convertDateObjToTimestmp(payload.endDate)
      payload = {...payload, endDate: endDateTimestamp}
    }
    if(payload.status) {
      let newStatus = this.filterForm?.get('status')?.value?.pop()
      payload = {...payload, status: newStatus}
    }
    this.events$ = this.eventService.getAllEvents(this.limit, this.page, payload);
    this.open = false
  }

  resetFilters() {
    this.events$ = this.eventService.getAllEvents(this.limit, this.page);
    this.isFilterActive.next(false);
    this.filterForm.reset();
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
    this.dialogSubs.forEach(val => val.unsubscribe());
  }
}
