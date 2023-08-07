import { Component } from '@angular/core';
import { TuiDayRange, TuiMonth } from '@taiga-ui/cdk';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  value: TuiDayRange | null = null;
  firstMonth = TuiMonth.currentLocal();
  lastMonth = TuiMonth.currentLocal().append({month: 1});

  onMonthChangeFirst(month: TuiMonth): void {
    this.firstMonth = month;
    this.lastMonth = month.append({month: 1});
}
}
