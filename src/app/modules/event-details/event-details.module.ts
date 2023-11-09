import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EventDetailsRoutingModule } from './event-details-routing.module';
import { EventDetailsComponent } from './event-details.component';
import { LayoutComponent } from '../layout/layout.component';
import { TuiButtonModule, TuiLoaderModule, TuiScrollbarModule, TuiSvgModule } from '@taiga-ui/core';
import { TuiCarouselModule, TuiRatingModule, TuiTabsModule } from '@taiga-ui/kit';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


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
    TuiLoaderModule,
    TuiButtonModule,
    TuiRatingModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class EventDetailsModule { }
