import { Component, Inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../layout/layout.component';
import { ActivatedRoute } from '@angular/router';
import { Subject, BehaviorSubject, takeUntil, Subscription } from 'rxjs';
import { EventsService } from '../events/services/events.service';
import { TuiButtonModule, TuiDataListModule, TuiDialogService, TuiLoaderModule, TuiTextfieldControllerModule } from '@taiga-ui/core';
import { PagesService } from '../pages/pages.service';
import { ApiResponse } from 'src/@core/models/core-response-model/response.model';
import { TuiDay, TuiTime } from '@taiga-ui/cdk';
import { TuiAccordionModule, TuiComboBoxModule, TuiDataListWrapperModule, TuiFilterByInputPipeModule, TuiInputModule, TuiInputTimeModule, TuiSelectModule, TuiToggleModule, tuiInputTimeOptionsProvider } from '@taiga-ui/kit';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators, FormArray } from '@angular/forms'
import { Router, RouterModule } from '@angular/router';
import { UppercaseDirective } from 'src/app/directives/uppercase.directive';

@Component({
  selector: 'app-agendas',
  standalone: true,
  imports: [
    CommonModule,
    LayoutComponent,
    TuiButtonModule,
    TuiLoaderModule,
    TuiAccordionModule,
    ReactiveFormsModule,
    FormsModule,
    TuiInputModule,
    TuiTextfieldControllerModule,
    TuiDataListWrapperModule,
    TuiSelectModule,
    TuiInputTimeModule,
    TuiToggleModule,
    TuiDataListModule,
    RouterModule,
    TuiComboBoxModule,
    TuiFilterByInputPipeModule,
    UppercaseDirective
  ],
  templateUrl: './agendas.component.html',
  styleUrls: ['./agendas.component.scss'],
  providers: [
    tuiInputTimeOptionsProvider({
      mode: 'HH:MM',
      maxValues: {HH: 12, MM: 59, SS: 59, MS: 999},
    }),
  ],
})

export class AgendasComponent implements OnDestroy {
  destroy = new Subject();
  saving = new Subject<boolean>();
  eventID: string | null = null;
  event: any;
  loadingData = new BehaviorSubject<boolean>(true);
  daysOfEvents: any[] = [];
  halls: any[] = [];
  speakers: any[] = [];
  allSpeakers: any[] = [];
  sponsors: any[] = [];
  sponsorList: any[] = [];
  speakerValue: any;
  dialogSubs: Subscription[] = [];
  venues: any[] = [];
  agendaForm = this.fb.group({
    agendas: this.fb.array(
      [
        this.fb.group({
          _id: [undefined],
          theme: [{value: null, disabled: false}, Validators.required],
          sponsor: [null],
          agendaTitle: [null, Validators.required],
          moderator: [null],
          day: [0, Validators.required],
          from: [null, Validators.required],
          to: [null, Validators.required],
          isPmFrom: [false],
          isLunchBreak: [false],
          isTeaBreak: [false],
          isPrelim: [false],
          isWorkshop: [false],
          workshopVenue: [null],
          isPmTo: [false],
          hall: [null, Validators.required],
          streamUrl: [null],
          speaker: [null],
          speakerTeam: this.fb.array([
            this.fb.group({
              name: [null],
              role: [null]
            })
          ]),
          attachments: [[]]
        })
      ]
    )
  });

  constructor(
    private ac: ActivatedRoute,
    private eventsService: EventsService,
    private pageService: PagesService,
    private fb: FormBuilder,
    private eventService: EventsService,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    private router: Router
  ) {
    this.ac.params.pipe(takeUntil(this.destroy)).subscribe(value => {
      this.eventID = value['id']
      this.eventsService.getEventByID(value['id'])
      .pipe(takeUntil(this.destroy)).subscribe((data: any) => {
        if(data) {
          this.event = data;
          this.pageService.getVenueById(data?.location?.id)
          .pipe(takeUntil(this.destroy)).subscribe((venue: ApiResponse<any>) => {
            if(!venue.hasErrors()) {
              this.halls = venue?.data[0]?.halls
            }
          });
          this.pageService.getAllSpeakers(1000, 1).pipe(takeUntil(this.destroy))
          .subscribe((speaker: ApiResponse<any>) => {
            if(!speaker.hasErrors()) {
              this.allSpeakers = speaker?.data?.data;
              this.speakers = speaker?.data?.data?.map((value: any) => value?.speakerName)
            }
          });
          this.pageService.getAllSponsors(1000, 1).pipe(takeUntil(this.destroy))
          .subscribe((sponsor: ApiResponse<any>) => {
            if(!sponsor.hasErrors()) {
              this.sponsorList = sponsor?.data?.data
              this.sponsors = sponsor?.data?.data?.map((value: any) => value?.sponsorName)
            }
          });
          this.pageService.getAllVenues(1000, 1).pipe(takeUntil(this.destroy)).subscribe(value => {
            this.venues = value?.data?.data?.map((venues: any) => venues.venueName);
            this.loadingData.next(false)
          });
          this.calculateEventDays(data)
          if(data?.agenda && data?.agenda?.length > 0) {
            let agendaDays: any[] = [];
            this.agendas.clear();
            data.agenda.map((agenda: any, index: number) => {
              let from = agenda.from?.split(' ');
              let to = agenda.to?.split(' ');
              agenda.day = this.convertTimestampToObject(agenda.day)
              agenda.from = this.convertTimeStringToObject(from[0])
              agenda.to = this.convertTimeStringToObject(to[0])
              agendaDays.push({...agenda.day})
              let formAgenda = this.fb.group({
                _id: [agenda._id],
                theme: [agenda.theme || null, Validators.required],
                agendaTitle: [agenda.agendaTitle || null, Validators.required],
                moderator: [agenda.moderator || null],
                sponsor: [agenda?.sponsor?.sponsorName || null],
                isPmFrom: [from[1]?.includes('AM') ? false: true],
                isPmTo: [to[1]?.includes('AM') ? false: true],
                isWorkshop: [agenda.isWorkshop],
                workshopVenue: [agenda.workshopVenue || null],
                isLunchBreak: [!['Lunch', 'Breakfast', 'Dinner', 'Gala Dinner', 'Other'].includes(agenda.agendaTitle) ? false : true],
                isTeaBreak: [!['Lunch Break', 'Tea Break'].includes(agenda.agendaTitle) ? false : true],
                isPrelim: [agenda?.isPrelim],
                day: [agenda.day, Validators.required],
                from: [agenda.from, Validators.required],
                to: [agenda.to, Validators.required],
                hall: [agenda.hall, Validators.required],
                speaker: [agenda.speaker?.speakerName || null],
                streamUrl: [agenda.streamUrl || null],
                speakerTeam: this.fb.array(agenda.speakerTeam?.map((team: {name: string, role: string}) => {
                  return this.fb.group({
                    name: [team.name || null],
                    role: [team.role || null]
                  })
                })),
                attachments: [agenda.attachments || []]
              });
              this.agendas.push(formAgenda)
              this.agendas.updateValueAndValidity();
            });
            agendaDays = [...new Map(agendaDays?.map((data: any) => [data['day'], data])).values()]
            // this.daysOfEvents = agendaDays;
          }
        }
      })
    })
  }

  getPostfix(index: number, isFromField: boolean): string {
    const isPmFrom = this.agendas.at(index)?.get('isPmFrom')?.value;
    const isPmTo = this.agendas.at(index)?.get('isPmTo')?.value;

    if (isFromField && isPmFrom) {
      return 'PM';
    } else if (!isFromField && isPmTo) {
      return 'PM';
    } else {
      return 'AM';
    }
  }

  get agendas() {
    return this.agendaForm.controls['agendas'] as FormArray
  }

  addAgenda(day: number) {
    const agendaForm = this.fb.group({
      _id: [undefined],
      theme: [{value: this.agendas.at(this.agendas.length - 1)?.get('theme')?.value, disabled: true}, Validators.required],
      sponsor: [null],
      agendaTitle: [null, Validators.required],
      moderator: [this.agendas.at(this.agendas.length - 1)?.get('moderator')?.value],
      day: [day, Validators.required],
      from: [null, Validators.required],
      to: [null, Validators.required],
      isLunchBreak: [false],
      isTeaBreak: [false],
      isPmFrom: [false],
      isPrelim: [false],
      isPmTo: [false],
      isWorkshop: [false],
      workshopVenue: [null],
      hall: [null, Validators.required],
      streamUrl: [null],
      speaker: [null],
      speakerTeam: this.fb.array(this.agendas.at(this.agendas.length - 1)?.get('speakerTeam')?.value?.map((team: {name: string, role: string}) => {
        return this.fb.group({
          name: [team.name || null],
          role: [team.role || null]
        })
      })),
      attachments: [[]]
    })
    this.agendas.push(agendaForm)
  }

  addWorkshop(day: number) {
    const agendaForm = this.fb.group({
      _id: [undefined],
      theme: ['Workshop', Validators.required],
      sponsor: [null],
      agendaTitle: [null, Validators.required],
      moderator: [null],
      day: [day, Validators.required],
      from: [null, Validators.required],
      to: [null, Validators.required],
      isLunchBreak: [false],
      isTeaBreak: [false],
      isPmFrom: [false],
      isPrelim: [false],
      isPmTo: [false],
      isWorkshop: [true],
      workshopVenue: [null],
      hall: [null, Validators.required],
      streamUrl: [null],
      speaker: [null],
      speakerTeam: [[]],
      attachments: [[]]
    })
    this.agendas.push(agendaForm)
  }

  addLunchBreak(day: number) {
    const agendaForm = this.fb.group({
      _id: [undefined],
      theme: [null],
      sponsor: [null],
      agendaTitle: ['Lunch'],
      day: [day],
      from: [null],
      to: [null],
      isLunchBreak: [true],
      isTeaBreak: [false],
      isPrelim: [false],
      isPmFrom: [false],
      isPmTo: [false],
      isWorkshop: [false],
      workshopVenue: [null],
      hall: [null],
      streamUrl: [null],
      speaker: [null],
      speakerTeam: [[]],
      attachments: [[]]
    })
    this.agendas.push(agendaForm)
  }

  addPreliminaries(day: number) {
    const agendaForm = this.fb.group({
      _id: [undefined],
      theme: [null],
      sponsor: [null],
      agendaTitle: [null],
      moderator: [null],
      day: [day],
      from: [null],
      to: [null],
      isLunchBreak: [false],
      isTeaBreak: [false],
      isPrelim: [true],
      isPmFrom: [false],
      isPmTo: [false],
      isWorkshop: [false],
      workshopVenue: [null],
      hall: [null],
      streamUrl: [null],
      speaker: [null],
      speakerTeam: [[]],
      attachments: [[]]
    })
    this.agendas.insert(day, agendaForm)
  }

  addTeaBreak(day: number) {
    const agendaForm = this.fb.group({
      _id: [undefined],
      theme: [null],
      sponsor: [null],
      agendaTitle: ['Tea Break'],
      day: [day],
      from: [null],
      to: [null],
      isLunchBreak: [false],
      isTeaBreak: [true],
      isPmFrom: [false],
      isPmTo: [false],
      isWorkshop: [false],
      workshopVenue: [null],
      hall: [null],
      streamUrl: [null],
      speaker: [null],
      speakerTeam: [[]],
      attachments: [[]]
    })
    this.agendas.push(agendaForm)
  }

  removeAgenda(index: number) {
    this.agendas.removeAt(index);
  }

  getSpeakerTeam(i: number) {
    return this.agendas.at(i).get("speakerTeam") as FormArray
  }

  addSpeaker(index: number) {
    const newTeam = this.fb.group({
      name: [null],
      role: [null]
    })
    this.getSpeakerTeam(index)?.push(newTeam)
  }

  removeSpeakerTeam(agendaIndex:number, teamIndex:number) {
    const control = <FormArray>this.agendas.at(agendaIndex)?.get('speakerTeam');
    control.removeAt(teamIndex);
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
      return new TuiDay(year, month, day)
    }
    return timestamp
  }

  calculateEventDays(data: any) {
    let from = this.convertTimestampToObject(data?.startDate);
    let to = this.convertTimestampToObject(data?.endDate);
    let daysOfEventsValue = [{...from}, {...to}];
    let startDay = new TuiDay(daysOfEventsValue[0]?.year, daysOfEventsValue[0]?.month, daysOfEventsValue[0]?.day);
    let endDay = new TuiDay(daysOfEventsValue[1]?.year, daysOfEventsValue[1]?.month, daysOfEventsValue[1]?.day);
    let daysArr = []
    while (startDay < endDay) {
      if(startDay.monthSameOrBefore(endDay)) {
        if(startDay.daysCount === startDay.day) {
          startDay = new TuiDay(startDay?.year, startDay?.month + 1, 1);
        }
        else {
          startDay = new TuiDay(startDay?.year, startDay?.month, startDay?.day + 1);
        }
      }
      else {
        startDay = new TuiDay(startDay?.year, startDay?.month + 1, 1);
      }
      if(startDay === endDay) {
        break
      }
      daysArr.push({...startDay})
    }
    daysOfEventsValue.pop();
    this.daysOfEvents = [...daysOfEventsValue, ...daysArr]
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

  addSpeakerDialog(content: any) {
    this.dialogSubs.push(this.dialogs.open(content, {
      dismissible: false,
      closeable: false,
      size: 'l'
    }).subscribe());
  }

  cancel() {
    this.router.navigate(['/events'])
  }

  convertTimeStringToObject(timeString: string) {
    if(typeof timeString == 'string') {
      const [hours, minutes] = timeString.split(':').map(Number)
      let time: TuiTime = new TuiTime(hours, minutes)
      return time
    }
    return timeString
  }

  submitAgenda() {
    this.saving.next(true)
    let agendasWithDays = this.agendaForm.value?.agendas;
    agendasWithDays = agendasWithDays?.map((data: any) => {
      data.from = data?.from + ' ' + (data?.isPmFrom == true ? 'PM': 'AM')
      data.to = data?.to + ' ' + (data?.isPmTo == true ? 'PM': 'AM');
      data.speaker = this.allSpeakers?.filter(value => value.speakerName == data?.speaker)[0] || null;
      data.sponsor = this.sponsorList?.filter(value => value.sponsorName == data?.sponsor)[0] || null;
      if(data?.speakerTeam[0]?.name == "" || data?.speakerTeam[0]?.name == null) {
        data.speakerTeam = []
      }
      if(!data?.theme && data?.isLunchBreak == false && data?.isTeaBreak == false && data?.isPrelim == false) {
        data.theme = this.agendas.at(this.agendas.length - 1)?.get('theme')?.value
      }
      if(data?.isLunchBreak == true || data?.isTeaBreak == true || data?.isPrelim == true) {
        data.theme = null
      }
      if(typeof data.day == 'number') {
        let day = this.daysOfEvents[data.day];
        day = new Date(day.year, day.month, day.day, 23, 59, 59, 0).getTime();
        data.from = data.from.toString();
        data.to = data.to.toString();
        delete data?.isPmFrom;
        delete data?.isPmTo;
        delete data?.isLunchBreak;
        delete data?.isTeaBreak;
        return {...data, day: day}
      }
      let day = new Date(data.day.year, data.day.month, data.day.day, 23, 59, 59, 0).getTime();
      data.from = data.from.toString();
      data.to = data.to.toString();
      delete data?.isPmFrom;
      delete data?.isPmTo;
      delete data?.isLunchBreak;
      delete data?.isTeaBreak;
      return Object.assign(data, {day: day})
    })
    debugger
    this.eventService.updateEvent({agenda: agendasWithDays}, this.eventID).pipe(takeUntil(this.destroy)).subscribe(val => {
      if(val) {
        this.saving.next(false)
        this.router.navigate(['/events'])
      }
      else {
        this.saving.next(false)
      }
    })
  }

  ngOnDestroy(): void {
    this.destroy.complete();
    this.destroy.unsubscribe();
  }
}
