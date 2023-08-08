import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EventsRoutingModule } from './events-routing.module';
import { EventsComponent } from './events.component';
import { TuiInputModule, TuiPaginationModule, TuiRatingModule } from '@taiga-ui/kit';
import { TuiButtonModule, TuiLoaderModule, TuiSvgModule, TuiTextfieldControllerModule } from '@taiga-ui/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutComponent } from '../layout/layout.component';


@NgModule({
  declarations: [
    EventsComponent
  ],
  imports: [
    CommonModule,
    EventsRoutingModule,
    TuiPaginationModule,
    TuiRatingModule,
    TuiSvgModule,
    TuiInputModule,
    TuiTextfieldControllerModule,
    ReactiveFormsModule,
    FormsModule,
    TuiButtonModule,
    LayoutComponent,
    TuiLoaderModule
  ]
})
export class EventsModule { }
