import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EventDetailsRoutingModule } from './event-details-routing.module';
import { EventDetailsComponent } from './event-details.component';
import { LayoutComponent } from '../layout/layout.component';


@NgModule({
  declarations: [
    EventDetailsComponent
  ],
  imports: [
    CommonModule,
    EventDetailsRoutingModule,
    LayoutComponent
  ]
})
export class EventDetailsModule { }
