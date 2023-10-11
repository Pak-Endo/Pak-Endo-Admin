import { Component, OnDestroy, Inject } from '@angular/core';
import { GuiPaging, GuiPagingDisplay, GuiSearching } from '@generic-ui/ngx-grid';
import { PagesService } from '../pages.service';
import  { Subject, Subscription, finalize, map, takeUntil } from 'rxjs';
import { ApiResponse } from 'src/@core/models/core-response-model/response.model';
import { NotificationsService } from 'src/@core/core-service/notifications.service';
import { TuiNotification } from '@taiga-ui/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { generateUniqueID } from 'src/@core/utils/utility-functions';
import { TuiDialogContext, TuiDialogService } from '@taiga-ui/core';
import {PolymorpheusContent} from '@tinkoff/ng-polymorpheus';
import { MediaUploadService } from 'src/@core/core-service/media-upload.service';
import {TuiCountryIsoCode} from '@taiga-ui/i18n';

@Component({
  templateUrl: './speakers.component.html',
  styleUrls: ['./speakers.component.scss']
})
export class SpeakersComponent implements OnDestroy {
  source: Array<any> = [];
  loading = true;
  speakerID: string | null = null;
  dialogSubs: Subscription[] = [];
  savingMember = new Subject<boolean>();
  readonly loadingFiles$ = new Subject<boolean>();
  searching: GuiSearching = {
    enabled: true,
    highlighting: true,
    placeholder: 'Search speakers'
  };
  paging: GuiPaging = {
		enabled: true,
		page: 1,
		pageSize: 5,
		pageSizes: [5, 15, 30],
		pagerBottom: true,
		display: GuiPagingDisplay.BASIC
	};
  limit: number = 1000;
  page = 1;
  destroy$ = new Subject();
  speakerForm = new FormGroup({
    speakerName: new FormControl<string | null | undefined>(null, Validators.required),
    speakerImg: new FormControl(null, ),
    email: new FormControl(null, Validators.compose([
      Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)
    ])),
    speakerContact: new FormControl(null),
    country: new FormControl(null),
    city: new FormControl(null),
    description: new FormControl(null),
  })
  readonly countries: readonly TuiCountryIsoCode[] = [
    TuiCountryIsoCode.PK,
    TuiCountryIsoCode.US,
    TuiCountryIsoCode.GB,
    TuiCountryIsoCode.FR,
    TuiCountryIsoCode.AU,
    TuiCountryIsoCode.IT,
    TuiCountryIsoCode.SA,
    TuiCountryIsoCode.CA,
    TuiCountryIsoCode.JP,
    TuiCountryIsoCode.CN,
    TuiCountryIsoCode.CO,
    TuiCountryIsoCode.BR,
    TuiCountryIsoCode.AR,
  ];
  countryIsoCode = TuiCountryIsoCode.PK;

  constructor(
    private pageService: PagesService,
    private notif: NotificationsService,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    private media: MediaUploadService
  ) {
    this.fetchSpeakerData()
  }

  get f() {
    return this.speakerForm.controls
  }

  fetchSpeakerData() {
    this.pageService.getAllSpeakers(this.limit, this.page)
    .pipe(takeUntil(this.destroy$)).subscribe((res: ApiResponse<any>) => {
      this.source = res.data?.data;
      this.loading = false;
    })
  }

  createSpeaker() {
    let payload: any = this.speakerForm.value;
    let uniqueID = generateUniqueID(this.speakerForm.value?.speakerName);
    payload = {...payload, uniqueID}
    this.pageService.addNewSpeaker(payload).pipe(takeUntil(this.destroy$)).subscribe((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('New speaker added', 'Add Speaker', TuiNotification.Success);
        this.dialogSubs.forEach(val => val.unsubscribe())
        this.speakerForm.reset()
        this.fetchSpeakerData()
      }
      else {
        this.notif.displayNotification(res.errors[0]?.error?.message, 'Add Speaker', TuiNotification.Error)
      }
    })
  }

  editSpeaker() {
    let payload: any = this.speakerForm.value;
    this.pageService.updateSpeaker(payload, this.speakerID).pipe(takeUntil(this.destroy$)).subscribe((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('Speaker updated', 'Edit Speaker', TuiNotification.Success);
        this.dialogSubs.forEach(val => val.unsubscribe())
        this.speakerForm.reset()
        this.fetchSpeakerData()
        this.speakerID = null;
      }
      else {
        this.notif.displayNotification(res.errors[0]?.error?.message, 'Edit Speaker', TuiNotification.Error)
      }
    })
  }

  deleteSpeaker() {
    this.pageService.deleteSpeaker(this.speakerID).pipe(takeUntil(this.destroy$)).subscribe((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('Speaker deleted', 'Delete Speaker', TuiNotification.Success);
        this.fetchSpeakerData()
        this.speakerID = null;
      }
      else {
        this.notif.displayNotification(res.errors[0]?.error?.message, 'Delete Speaker', TuiNotification.Error)
      }
    })
  }

  showAddorEditDialog(content: PolymorpheusContent<TuiDialogContext>, data?: any): void {
    if(data) {
      this.speakerID = data?._id;
      this.f['speakerName'].setValue(data?.speakerName)
      this.f['speakerImg'].setValue(data?.speakerImg || null)
      this.f['description'].setValue(data?.description || null)
      this.f['email'].setValue(data?.email || null);
      this.f['country'].setValue(data?.country || null);
      this.f['city'].setValue(data?.city || null);
      this.f['speakerContact'].setValue(data?.speakerContact || null);
    }
    this.dialogSubs.push(this.dialogs.open(content, {
      dismissible: false,
      closeable: false,
      size: 'l'
    }).subscribe());
  }

  openDeleteDialog(content: PolymorpheusContent<TuiDialogContext>, id: string): void {
    this.speakerID = id;
    this.dialogs.open(content, {
      dismissible: true,
      closeable: true,
    }).pipe(takeUntil(this.destroy$)).subscribe();
  }

  closeDialog(event: any) {
    event?.preventDefault();
    event?.stopPropagation();
    this.dialogSubs.forEach(val => val.unsubscribe());
    this.speakerID = null
    this.speakerForm.reset();
  }

  uploadSpeakerImage(event: any) {
    let file = event.target.files[0];
    if(file && ['image/jpg', 'image/jpeg', 'image/png', 'image/svg'].includes(file.type)) {
      return this.media.uploadMedia('test', file).pipe(
        map((res: ApiResponse<any>) => {
          if(!res.hasErrors()) {
            this.f['speakerImg']?.setValue(res?.data?.url)
            return res.data?.url
          }
          return null;
        }),
        finalize(() => this.loadingFiles$.next(false))
      ).pipe(takeUntil(this.destroy$)).subscribe()
    }
    return null
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
