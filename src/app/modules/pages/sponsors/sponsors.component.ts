import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GuiColumn, GuiPaging, GuiPagingDisplay, GuiSearching } from '@generic-ui/ngx-grid';

@Component({
  templateUrl: './sponsors.component.html',
  styleUrls: ['./sponsors.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SponsorsComponent {
  source: Array<any> = [];
  loading = false;
  columns: Array<GuiColumn> = [
    {
      header:'Name',
      field: 'sponsorName'
    },
    {
      header:'Logo',
      field: 'sponsorLogo'
    },
    {
      header:'Details',
      field: 'description'
    },
    {
      header:'Contact',
      field: 'contact'
    }
  ];
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
}
