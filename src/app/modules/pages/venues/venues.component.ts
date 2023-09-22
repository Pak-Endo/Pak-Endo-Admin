import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GuiColumn, GuiPaging, GuiPagingDisplay, GuiSearching } from '@generic-ui/ngx-grid';

@Component({
  templateUrl: './venues.component.html',
  styleUrls: ['./venues.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VenuesComponent {
  source: Array<any> = [];
  loading = false;
  columns: Array<GuiColumn> = [
    {
      header:'Venue Name',
      field: 'venueName'
    },
    {
      header:'City',
      field: 'city'
    },
    {
      header:'Halls',
      field: 'halls'
    }
  ];
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
}
