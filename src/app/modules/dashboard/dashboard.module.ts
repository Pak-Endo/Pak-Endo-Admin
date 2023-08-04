import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { HeaderComponent } from 'src/app/standalone-components/header/header.component';
import { SidenavComponent } from 'src/app/standalone-components/sidenav/sidenav.component';
import {TuiArcChartModule} from '@taiga-ui/addon-charts';


@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    HeaderComponent,
    SidenavComponent,
    TuiArcChartModule
  ]
})
export class DashboardModule { }
