import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EventsRoutingModule } from './events-routing.module';
import { EventsComponent } from './events.component';
import { TuiInputTimeModule, TuiInputDateRangeModule, TuiInputFilesModule, TuiInputModule, TuiMarkerIconModule, TuiPaginationModule, TuiRatingModule, TuiTextAreaModule, TuiStepperModule, TuiDataListWrapperModule, TuiSelectModule, TuiInputPhoneInternationalModule, TuiInputDateModule, TuiCheckboxLabeledModule } from '@taiga-ui/kit';
import { TuiButtonModule, TuiExpandModule, TuiHostedDropdownModule, TuiLabelModule, TuiLoaderModule, TuiSvgModule, TuiTextfieldControllerModule } from '@taiga-ui/core';
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
    TuiExpandModule,
    TuiInputTimeModule,
    TuiInputDateRangeModule,
    TuiStepperModule,
    TuiDataListWrapperModule,
    TuiSelectModule,
    TuiInputPhoneInternationalModule,
    TuiHostedDropdownModule,
    TuiInputDateModule,
    TuiCheckboxLabeledModule
  ]
})
export class EventsModule { }
