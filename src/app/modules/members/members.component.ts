import { Component, Inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TuiDialogContext, TuiDialogService } from '@taiga-ui/core';
import {PolymorpheusContent} from '@tinkoff/ng-polymorpheus';
import { Subject, Subscription, debounceTime, distinctUntilChanged, shareReplay, switchMap, takeUntil } from 'rxjs';
import { MembersService } from './services/members.service';
import {TuiCountryIsoCode} from '@taiga-ui/i18n'
import { Type } from 'src/@core/models/user.model';
import { GuiColumn, GuiPaging, GuiPagingDisplay, GuiSearching } from '@generic-ui/ngx-grid';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss']
})
export class MembersComponent implements OnDestroy {
  searchValue: FormControl = new FormControl();
  limit: number = 1000;
  page: number = 1;
  index: number = 0;
  destroy$ = new Subject();
  memberID!: string | null;
  memberForm!: FormGroup;
  prefixes: string[] = ['Dr.', 'Prof. Dr.'];
  genders: string[] = ['Male', 'Female', 'Other'];
  types: string[] = ['PES Executive Member', 'PES Honorary Member', 'International Executive Membership', 'Scientific Members', 'Scientific Executive Members', 'Non-Member'];
  dialogSubs: Subscription[] = [];
  readonly countries: readonly TuiCountryIsoCode[] = [
    TuiCountryIsoCode.PK,
    TuiCountryIsoCode.US,
    TuiCountryIsoCode.GB,
    TuiCountryIsoCode.FR
  ];
  countryIsoCode = TuiCountryIsoCode.PK;
  savingMember = new Subject<boolean>();
  approveMembertype = new FormControl<any>(null, Validators.required)
  source: Array<any> = [];
  loading = true;
  columns: Array<GuiColumn> = [
    {
      header:'Member ID',
      field: 'memberID'
    },
    {
      header:'Fullname',
      field: 'fullName'
    },
    {
      header:'Phone No.',
      field: 'phoneNumber'
    },
    {
      header:'Email',
      field: 'email'
    },
    {
      header:'City',
      field: 'city'
    },
    {
      header:'Status',
      field: 'status'
    }
  ];
  searching: GuiSearching = {
    enabled: true,
    highlighting: true,
    placeholder: 'Search member data'
  };
  paging: GuiPaging = {
		enabled: true,
		page: 1,
		pageSize: 5,
		pageSizes: [5, 15, 30],
		pagerBottom: true,
		display: GuiPagingDisplay.BASIC
	};

  constructor(
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    private memberService: MembersService,
    private fb: FormBuilder
  ) {
    this.initMemberForm();
    this.memberService.getAllMembers(this.limit, this.page, this.searchValue?.value || ' ')
    .pipe(takeUntil(this.destroy$)).subscribe((data: any) => {
      this.source = data?.users?.map((value: any) => {
        return {
          ...value,
          status: this.showStatus(value?.status)
        }
      });
      this.loading = false;
    })
    this.searchValue.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      shareReplay(),
      switchMap((val: string) => this.memberService.getAllMembers(this.limit, this.page, val)),
      takeUntil(this.destroy$)
    ).subscribe((data: any) => {
      this.source = data?.users;
      this.loading = false;
    });
  }

  initMemberForm() {
    this.memberForm = this.fb.group({
      prefix: [null, Validators.required],
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      email: [null, Validators.compose([
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)
      ])],
      phoneNumber: [null, Validators.required],
      gender: [null, Validators.required],
      status: [null],
      city: [null, Validators.required],
      type: [null, Validators.required]
    })
  }

  get f() {
    return this.memberForm.controls;
  }

  showAddorEditDialog(content: PolymorpheusContent<TuiDialogContext>, data?: any): void {
    if(data) {
      this.memberID = data?._id;
      this.f['firstName'].setValue(data?.firstName)
      this.f['lastName'].setValue(data?.lastName)
      this.f['prefix'].setValue(data?.prefix)
      this.f['phoneNumber'].setValue(data?.phoneNumber)
      this.f['city'].setValue(data?.city)
      this.f['gender'].setValue(data?.gender)
      this.f['status'].setValue(data?.status)
      this.f['email'].setValue(data?.email);
      let statuses: any = new Object(Type)
      for (const key in statuses) {
        if(key == data.type) {
          data.type = statuses[key];
        }
      }
      this.f['type'].setValue(data.type)
    }
    this.dialogSubs.push(this.dialogs.open(content, {
      dismissible: false,
      closeable: true,
      size: 'fullscreen'
    }).subscribe());
  }

  sendMemberForApproval(content: PolymorpheusContent<TuiDialogContext>, data?: any): void {
    this.memberID = data?._id;
    this.dialogSubs.push(this.dialogs.open(content, {
      dismissible: true,
      closeable: true,
    }).subscribe());
  }

  approveMember() {
    this.savingMember.next(true)
    const payload = {type: this.approveMembertype.value}
    let data: any = new Object(Type)
    for (const key in data) {
      if(data[key] == payload.type) {
        payload.type = key
      }
    }
    this.memberService.approveUser(this.memberID, payload).pipe(takeUntil(this.destroy$)).subscribe(val => {
      if(val) {
        this.memberID = null
        this.memberService.getAllMembers(this.limit, this.page, this.searchValue?.value || ' ')
        .pipe(takeUntil(this.destroy$)).subscribe((data: any) => {
          this.source = data?.users?.map((value: any) => {
            return {
              ...value,
              status: this.showStatus(value?.status)
            }
          });
        });
        this.dialogSubs.forEach(val => val.unsubscribe());
        this.approveMembertype.reset();
        this.savingMember.next(false)
      }
      else {
        this.savingMember.next(false)
      }
    })
  }

  openDeleteDialog(content: PolymorpheusContent<TuiDialogContext>, id: string): void {
    this.memberID = id;
    this.dialogs.open(content, {
      dismissible: true,
      closeable: true,
    }).pipe(takeUntil(this.destroy$)).subscribe();
  }

  closeDialog(event: any) {
    event.preventDefault();
    event.stopPropagation();
    this.dialogSubs.forEach(val => val.unsubscribe());
    this.memberID = null
    this.memberForm.reset();
  }

  trackByFn(item: any, index: number): string {
    return item?._id
  }

  goToPage(index: number): void {
    this.index = index;
    this.page = index;
    this.memberService.getAllMembers(this.limit, this.page, this.searchValue?.value || ' ')
    .pipe(takeUntil(this.destroy$)).subscribe((data: any) => {
      this.source = data?.users?.map((value: any) => {
        return {
          ...value,
          status: this.showStatus(value?.status)
        }
      });
    });
  }

  floorNumber(value: number) {
    return value >= this.limit ? Math.floor(value) : Math.ceil(value)
  }

  showStatus(status: number): string {
    let returnStr: any = '';
    switch (status) {
      case 1:
        returnStr = 'Approved';
        return returnStr
      case 2:
        returnStr = 'Pending';
        return returnStr
      case 3:
        returnStr = 'Rejected';
        return returnStr
      default:
        returnStr = 'Banned';
        return returnStr
    }
  }

  createMember() {
    this.savingMember.next(true);
    let newPassword = this.memberForm.value?.firstName.toLowerCase() + '-' + this.memberForm.value?.lastName.toLowerCase() + '@' + Math.round(Math.random() * (100 - 1) + 1);
    const payload = {...this.memberForm.value, password: newPassword , status: 'Approved'};
    let data: any = new Object(Type)
    for (const key in data) {
      if(data[key] == payload.type) {
        payload.type = key
      }
    }
    this.memberService.postNewUser(payload)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if(res) {
        this.memberService.getAllMembers(this.limit, this.page, this.searchValue?.value || ' ')
        .pipe(takeUntil(this.destroy$)).subscribe((data: any) => {
          this.source = data?.users?.map((value: any) => {
            return {
              ...value,
              status: this.showStatus(value?.status)
            }
          });
        });
        this.dialogSubs.forEach(val => val.unsubscribe());
        this.memberForm.reset();
        this.savingMember.next(false)
        this.memberID = null
      }
    })
  }

  editMemberData() {
    this.savingMember.next(true)
    const payload = {...this.memberForm.value};
    let data: any = new Object(Type)
    for (const key in data) {
      if(data[key] == payload.type) {
        payload.type = key
      }
    }
    this.memberService.updateUser(payload, this.memberID).pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if(res) {
        this.memberService.getAllMembers(this.limit, this.page, this.searchValue?.value || ' ')
        .pipe(takeUntil(this.destroy$)).subscribe((data: any) => {
          this.source = data?.users?.map((value: any) => {
            return {
              ...value,
              status: this.showStatus(value?.status)
            }
          });
          this.loading = false;
        });
        this.dialogSubs.forEach(val => val.unsubscribe());
        this.memberForm.reset();
        this.savingMember.next(false);
        this.memberID = null
      }
    });
  }

  deleteMember() {
    this.savingMember.next(true)
    this.dialogSubs.push(this.memberService.deleteUser(this.memberID)
    .pipe(takeUntil(this.destroy$))
    .subscribe(val => {
      if(val) {
        this.savingMember.next(false);
        this.memberService.getAllMembers(this.limit, this.page, this.searchValue?.value || ' ')
        .pipe(takeUntil(this.destroy$)).subscribe((data: any) => {
          this.source = data?.users?.map((value: any) => {
            return {
              ...value,
              status: this.showStatus(value?.status)
            }
          });
          this.loading = false;
          this.memberID = null
        });
      }
    }))
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
