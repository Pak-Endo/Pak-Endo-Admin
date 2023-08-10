import { Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TuiDialogContext, TuiDialogService } from '@taiga-ui/core';
import {PolymorpheusContent} from '@tinkoff/ng-polymorpheus';
import { Observable, Subject, debounceTime, distinctUntilChanged, shareReplay, switchMap, takeUntil } from 'rxjs';
import { MembersService } from './services/members.service';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss']
})
export class MembersComponent {
  searchValue: FormControl = new FormControl();
  limit: number = 8;
  page: number = 1;
  index: number = 0;
  members$: Observable<any>;
  destroy$ = new Subject();

  constructor(
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    private memberService: MembersService
  ) {
    this.members$ = this.memberService.getAllMembers(this.limit, this.page, this.searchValue?.value || ' ');
    this.searchValue.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      shareReplay(),
      switchMap((val: string) => this.members$ = this.memberService.getAllMembers(this.limit, this.page, val)),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  showAddorEditDialog(content: PolymorpheusContent<TuiDialogContext>, data?: any): void {

  }

  openDeleteDialog(content: PolymorpheusContent<TuiDialogContext>, id: string): void {
    
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
}
