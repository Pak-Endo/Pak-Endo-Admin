import { ChangeDetectionStrategy, Component, Inject, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { GuiPaging, GuiPagingDisplay, GuiSearching } from '@generic-ui/ngx-grid';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { PagesService } from '../pages.service';
import { NotificationsService } from 'src/@core/core-service/notifications.service';
import { TuiDialogService, TuiNotification, TuiDialogContext } from '@taiga-ui/core';
import { ApiResponse } from 'src/@core/models/core-response-model/response.model';
import { generateUniqueID } from 'src/@core/utils/utility-functions';
import {PolymorpheusContent} from '@tinkoff/ng-polymorpheus';

@Component({
  templateUrl: './venues.component.html',
  styleUrls: ['./venues.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class VenuesComponent implements OnDestroy {
  source: Array<any> = [];
  loading = false;
  searching: GuiSearching = {
    enabled: true,
    highlighting: true,
    placeholder: 'Search venues'
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
  venueID: string | null = null;
  readonly loadingFiles$ = new Subject<boolean>();
  venueForm = new FormGroup({
    venueName: new FormControl<string | null | undefined>(null, Validators.required),
    city: new FormControl(null, Validators.required),
    halls: new FormControl([], Validators.required)
  });
  constructor(
    private pageService: PagesService,
    private notif: NotificationsService,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService
  ) {
    this.fetchVenues()
  }

  get f() {
    return this.venueForm.controls
  }

  fetchVenues() {
    this.pageService.getAllVenues(this.limit, this.page)
    .pipe(takeUntil(this.destroy$)).subscribe((res: ApiResponse<any>) => {
      this.source = res.data?.data
    })
  }

  createVenue() {
    let payload: any = this.venueForm.value;
    let uniqueID = generateUniqueID(this.venueForm.value?.venueName);
    payload = {...payload, uniqueID}
    this.pageService.addNewVenue(payload).pipe(takeUntil(this.destroy$)).subscribe((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('New venue added', 'Add Venue', TuiNotification.Success);
        this.dialogSubs.forEach(val => val.unsubscribe())
        this.venueForm.reset()
        this.fetchVenues()
      }
      else {
        this.notif.displayNotification(res.errors[0]?.error?.message, 'Add Venue', TuiNotification.Error)
      }
    })
  }

  editVenue() {
    let payload: any = this.venueForm.value;
    this.pageService.updateVenue(payload, this.venueID).pipe(takeUntil(this.destroy$)).subscribe((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('Venue updated', 'Edit Venue', TuiNotification.Success);
        this.dialogSubs.forEach(val => val.unsubscribe())
        this.venueForm.reset()
        this.fetchVenues()
        this.venueID = null;
      }
      else {
        this.notif.displayNotification(res.errors[0]?.error?.message, 'Edit Venue', TuiNotification.Error)
      }
    })
  }

  deleteVenue() {
    this.pageService.deleteVenue(this.venueID).pipe(takeUntil(this.destroy$)).subscribe((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('Venue deleted', 'Delete Venue', TuiNotification.Success);
        this.fetchVenues()
        this.venueID = null;
      }
      else {
        this.notif.displayNotification(res.errors[0]?.error?.message, 'Delete Venue', TuiNotification.Error)
      }
    })
  }

  showAddorEditDialog(content: PolymorpheusContent<TuiDialogContext>, data?: any): void {
    if(data) {
      this.venueID = data?._id;
      this.f['venueName'].setValue(data?.venueName)
      this.f['halls'].setValue(data?.halls)
      this.f['city'].setValue(data?.city)
    }
    this.dialogSubs.push(this.dialogs.open(content, {
      dismissible: false,
      closeable: false,
      size: 'l'
    }).subscribe());
  }

  openDeleteDialog(content: PolymorpheusContent<TuiDialogContext>, id: string): void {
    this.venueID = id;
    this.dialogs.open(content, {
      dismissible: true,
      closeable: true,
    }).pipe(takeUntil(this.destroy$)).subscribe();
  }

  closeDialog(event: any) {
    event?.preventDefault();
    event?.stopPropagation();
    this.dialogSubs.forEach(val => val.unsubscribe());
    this.venueID = null
    this.venueForm.reset();
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
