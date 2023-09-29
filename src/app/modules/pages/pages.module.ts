import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagesRoutingModule } from './pages-routing.module';
import { PagesComponent } from './pages.component';
import { LayoutComponent } from '../layout/layout.component';
import { SpeakersComponent } from './speakers/speakers.component';
import { SponsorsComponent } from './sponsors/sponsors.component';
import { VenuesComponent } from './venues/venues.component';
import { GuiGridModule } from '@generic-ui/ngx-grid';
import { TuiButtonModule } from '@taiga-ui/core/components';
import { ReactiveFormsModule, FormsModule } from '@angular/forms'
import { TuiInputModule, TuiInputPhoneInternationalModule, TuiMarkerIconModule, TuiTextAreaModule, TuiInputTagModule, TuiDataListWrapperModule, TuiSelectModule } from '@taiga-ui/kit';
import { TuiTextfieldControllerModule } from '@taiga-ui/core';

@NgModule({
  declarations: [
    PagesComponent,
    SpeakersComponent,
    SponsorsComponent,
    VenuesComponent
  ],
  imports: [
    CommonModule,
    PagesRoutingModule,
    LayoutComponent,
    GuiGridModule,
    TuiButtonModule,
    ReactiveFormsModule,
    FormsModule,
    TuiInputModule,
    TuiTextfieldControllerModule,
    TuiTextAreaModule,
    TuiMarkerIconModule,
    TuiInputPhoneInternationalModule,
    TuiInputTagModule,
    TuiDataListWrapperModule,
    TuiSelectModule
  ]
})
export class PagesModule { }
