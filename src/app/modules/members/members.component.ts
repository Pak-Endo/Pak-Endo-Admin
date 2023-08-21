import { Component, Inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TuiDialogContext, TuiDialogService } from '@taiga-ui/core';
import {PolymorpheusContent} from '@tinkoff/ng-polymorpheus';
import { Observable, Subject, Subscription, debounceTime, distinctUntilChanged, shareReplay, switchMap, takeUntil } from 'rxjs';
import { MembersService } from './services/members.service';
import {TuiCountryIsoCode} from '@taiga-ui/i18n'
import { Type } from 'src/@core/models/user.model';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss']
})
export class MembersComponent implements OnDestroy {
  searchValue: FormControl = new FormControl();
  limit: number = 8;
  page: number = 1;
  index: number = 0;
  members$: Observable<any>;
  destroy$ = new Subject();
  memberID!: string | null;
  memberForm!: FormGroup;
  prefixes: string[] = ['Dr.', 'Prof. Dr.'];
  genders: string[] = ['Male', 'Female', 'Other'];
  types: string[] = ['PES Executive Member', 'PES Honorary Member', 'International Executive Membership', 'Scientific Members', 'Scientific Executive Members'];
  dialogSubs: Subscription[] = [];
  readonly countries: readonly TuiCountryIsoCode[] = [
    TuiCountryIsoCode.PK,
    TuiCountryIsoCode.US,
    TuiCountryIsoCode.GB,
    TuiCountryIsoCode.FR
  ];
  countryIsoCode = TuiCountryIsoCode.PK;
  savingMember = new Subject<boolean>();

  constructor(
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    private memberService: MembersService,
    private fb: FormBuilder
  ) {
    this.initMemberForm();
    this.members$ = this.memberService.getAllMembers(this.limit, this.page, this.searchValue?.value || ' ');
    this.searchValue.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      shareReplay(),
      switchMap((val: string) => this.members$ = this.memberService.getAllMembers(this.limit, this.page, val)),
      takeUntil(this.destroy$)
    ).subscribe();
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
      this.f['status'].setValue(this.showStatus(data?.status))
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
    }).pipe(takeUntil(this.destroy$)).subscribe());
  }

  openDeleteDialog(content: PolymorpheusContent<TuiDialogContext>, id: string): void {
    this.memberID = id;
    this.dialogs.open(content, {
      dismissible: true,
      closeable: true,
    }).pipe(takeUntil(this.destroy$)).subscribe();
  }

  closeDialog() {
    this.dialogSubs.forEach(val => val.unsubscribe());
    this.memberForm.reset();
  }

  trackByFn(item: any, index: number): string {
    return item?._id
  }

  goToPage(index: number): void {
    this.index = index;
    this.page = index + 1;
    this.members$ = this.memberService.getAllMembers(this.limit, this.page, this.searchValue?.value || ' ');
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
    this.savingMember.next(true)
    const payload = {...this.memberForm.value, password: '12345678', status: 'Approved'};
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
        this.members$ = this.memberService.getAllMembers(this.limit, this.page, this.searchValue?.value || ' ');
        this.dialogSubs.forEach(val => val.unsubscribe());
        this.memberForm.reset();
        this.savingMember.next(false)
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
        this.members$ = this.memberService.getAllMembers(this.limit, this.page, this.searchValue?.value || ' ');
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
        this.members$ = this.memberService.getAllMembers(this.limit, this.page, this.searchValue?.value || ' ');
      }
    }))
  }
  
  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
