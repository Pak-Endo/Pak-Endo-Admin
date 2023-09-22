import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagesRoutingModule } from './pages-routing.module';
import { PagesComponent } from './pages.component';
import { LayoutComponent } from '../layout/layout.component';
import { SpeakersComponent } from './speakers/speakers.component';
import { SponsorsComponent } from './sponsors/sponsors.component';
import { VenuesComponent } from './venues/venues.component';


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
    LayoutComponent
  ]
})
export class PagesModule { }
