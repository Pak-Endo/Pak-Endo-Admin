import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PagesComponent } from './pages.component';
import { SpeakersComponent } from './speakers/speakers.component';
import { SponsorsComponent } from './sponsors/sponsors.component';
import { VenuesComponent } from './venues/venues.component';

const routes: Routes = [
  {
    path: '',
    component: PagesComponent,
    children: [
      {
        path: 'speakers',
        component: SpeakersComponent,
      },
      {
        path: 'sponsors',
        component: SponsorsComponent,
      },
      {
        path: 'venues',
        component: VenuesComponent,
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
