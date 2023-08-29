import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EventDetailsRoutingModule } from './event-details-routing.module';
import { EventDetailsComponent } from './event-details.component';
import { LayoutComponent } from '../layout/layout.component';
import { TuiLoaderModule, TuiScrollbarModule, TuiSvgModule } from '@taiga-ui/core';
import { TuiCarouselModule, TuiTabsModule } from '@taiga-ui/kit';


@NgModule({
  declarations: [
    EventDetailsComponent
  ],
  imports: [
    CommonModule,
    EventDetailsRoutingModule,
    LayoutComponent,
    TuiSvgModule,
    TuiTabsModule,
    TuiScrollbarModule,
    TuiCarouselModule,
    TuiLoaderModule
  ]
})
export class EventDetailsModule { }
