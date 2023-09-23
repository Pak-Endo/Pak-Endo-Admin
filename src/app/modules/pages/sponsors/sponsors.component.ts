import { ChangeDetectionStrategy, Component, Inject, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { GuiPaging, GuiPagingDisplay, GuiSearching } from '@generic-ui/ngx-grid';
import { Subject, Subscription, finalize, map, takeUntil } from 'rxjs';
import { PagesService } from '../pages.service';
import { NotificationsService } from 'src/@core/core-service/notifications.service';
import { TuiDialogContext, TuiDialogService, TuiNotification } from '@taiga-ui/core';
import { MediaUploadService } from 'src/@core/core-service/media-upload.service';
import { ApiResponse } from 'src/@core/models/core-response-model/response.model';
import { generateUniqueID } from 'src/@core/utils/utility-functions';
import {PolymorpheusContent} from '@tinkoff/ng-polymorpheus';
import {TuiCountryIsoCode} from '@taiga-ui/i18n';

@Component({
  templateUrl: './sponsors.component.html',
  styleUrls: ['./sponsors.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class SponsorsComponent implements OnDestroy {
  source: Array<any> = [];
  loading = false;
  searching: GuiSearching = {
    enabled: true,
    highlighting: true,
    placeholder: 'Search sponsors'
  };
  paging: GuiPaging = {
		enabled: true,
		page: 1,
		pageSize: 5,
		pageSizes: [5, 15, 30],
		pagerBottom: true,
		display: GuiPagingDisplay.BASIC
	};
  savingMember = new Subject<boolean>();
  destroy$ = new Subject();
  limit: number = 1000;
  page = 1;
  dialogSubs: Subscription[] = [];
  sponsorID: string | null = null;
  readonly loadingFiles$ = new Subject<boolean>();
  sponsorForm = new FormGroup({
    sponsorName: new FormControl<string | null | undefined>(null, Validators.required),
    sponsorLogo: new FormControl(null, Validators.required),
    contact: new FormControl(null, Validators.required),
    description: new FormControl(null, Validators.required),
  });
  readonly countries: readonly TuiCountryIsoCode[] = [
    TuiCountryIsoCode.PK,
    TuiCountryIsoCode.US,
    TuiCountryIsoCode.GB,
    TuiCountryIsoCode.FR
  ];
  countryIsoCode = TuiCountryIsoCode.PK;

  constructor(
    private pageService: PagesService,
    private notif: NotificationsService,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    private media: MediaUploadService
  ) {
    this.fetchSponsorData()
  }

  get f() {
    return this.sponsorForm.controls
  }

  fetchSponsorData() {
    this.pageService.getAllSponsors(this.limit, this.page)
    .pipe(takeUntil(this.destroy$)).subscribe((res: ApiResponse<any>) => {
      this.source = res.data?.data
    })
  }

  createSponsor() {
    let payload: any = this.sponsorForm.value;
    let uniqueID = generateUniqueID(this.sponsorForm.value?.sponsorName);
    payload = {...payload, uniqueID}
    this.pageService.addNewSponsor(payload).pipe(takeUntil(this.destroy$)).subscribe((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('New sponsor added', 'Add Sponsor', TuiNotification.Success);
        this.dialogSubs.forEach(val => val.unsubscribe())
        this.sponsorForm.reset()
        this.fetchSponsorData()
      }
      else {
        this.notif.displayNotification(res.errors[0]?.error?.message, 'Add Sponsor', TuiNotification.Error)
      }
    })
  }

  editSponsor() {
    let payload: any = this.sponsorForm.value;
    this.pageService.updateSponsor(payload, this.sponsorID).pipe(takeUntil(this.destroy$)).subscribe((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('Sponsor updated', 'Edit Sponsor', TuiNotification.Success);
        this.dialogSubs.forEach(val => val.unsubscribe())
        this.sponsorForm.reset()
        this.fetchSponsorData()
        this.sponsorID = null;
      }
      else {
        this.notif.displayNotification(res.errors[0]?.error?.message, 'Edit Sponsor', TuiNotification.Error)
      }
    })
  }

  deleteSponsor() {
    this.pageService.deleteSponsor(this.sponsorID).pipe(takeUntil(this.destroy$)).subscribe((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('Sponsor deleted', 'Delete Sponsor', TuiNotification.Success);
        this.fetchSponsorData()
        this.sponsorID = null;
      }
      else {
        this.notif.displayNotification(res.errors[0]?.error?.message, 'Delete Sponsor', TuiNotification.Error)
      }
    })
  }

  showAddorEditDialog(content: PolymorpheusContent<TuiDialogContext>, data?: any): void {
    if(data) {
      this.sponsorID = data?._id;
      this.f['sponsorName'].setValue(data?.sponsorName)
      this.f['sponsorLogo'].setValue(data?.sponsorLogo)
      this.f['description'].setValue(data?.description)
      this.f['contact'].setValue(data?.contact);
    }
    this.dialogSubs.push(this.dialogs.open(content, {
      dismissible: false,
      closeable: false,
      size: 'l'
    }).subscribe());
  }

  openDeleteDialog(content: PolymorpheusContent<TuiDialogContext>, id: string): void {
    this.sponsorID = id;
    this.dialogs.open(content, {
      dismissible: true,
      closeable: true,
    }).pipe(takeUntil(this.destroy$)).subscribe();
  }

  closeDialog(event: any) {
    event?.preventDefault();
    event?.stopPropagation();
    this.dialogSubs.forEach(val => val.unsubscribe());
    this.sponsorID = null
    this.sponsorForm.reset();
  }

  uploadSponsorImage(event: any) {
    let file = event.target.files[0];
    if(file && ['image/jpg', 'image/jpeg', 'image/png', 'image/svg'].includes(file.type)) {
      return this.media.uploadMedia('test', file).pipe(
        map((res: ApiResponse<any>) => {
          if(!res.hasErrors()) {
            this.f['sponsorLogo']?.setValue(res?.data?.url)
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
