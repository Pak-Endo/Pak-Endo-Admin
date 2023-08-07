import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { HeaderComponent } from 'src/app/standalone-components/header/header.component';
import { SidenavComponent } from 'src/app/standalone-components/sidenav/sidenav.component';
import { TuiCalendarModule } from '@taiga-ui/core';


@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    HeaderComponent,
    SidenavComponent,
    NgOptimizedImage,
    TuiCalendarModule
  ]
})
export class DashboardModule { }
