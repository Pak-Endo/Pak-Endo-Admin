import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EventsRoutingModule } from './events-routing.module';
import { EventsComponent } from './events.component';
import { TuiInputDateTimeModule, TuiInputFilesModule, TuiInputModule, TuiMarkerIconModule, TuiPaginationModule, TuiRatingModule, TuiTextAreaModule } from '@taiga-ui/kit';
import { TuiButtonModule, TuiExpandModule, TuiLabelModule, TuiLoaderModule, TuiSvgModule, TuiTextfieldControllerModule } from '@taiga-ui/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutComponent } from '../layout/layout.component';


@NgModule({
  declarations: [
    EventsComponent
  ],
  imports: [
    CommonModule,
    EventsRoutingModule,
    TuiTextAreaModule,
    TuiTextfieldControllerModule,
    TuiInputDateTimeModule,
    TuiLabelModule,
    TuiInputFilesModule,
    TuiPaginationModule,
    TuiRatingModule,
    TuiSvgModule,
    TuiInputModule,
    ReactiveFormsModule,
    FormsModule,
    TuiButtonModule,
    LayoutComponent,
    TuiLoaderModule,
    TuiMarkerIconModule,
    TuiExpandModule
  ]
})
export class EventsModule { }
