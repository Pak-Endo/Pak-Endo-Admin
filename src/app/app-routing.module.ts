import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './modules/auth/guard/auth.guard';
import { AgendasComponent } from './modules/agendas/agendas.component';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'events',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/events/events.module').then(m => m.EventsModule)
  },
  {
    path: 'agendas/:id',
    canActivate: [AuthGuard],
    component: AgendasComponent
  },
  {
    path: 'members',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/members/members.module').then(m => m.MembersModule)
  },
  {
    path: 'event-details/:id',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/event-details/event-details.module').then(m => m.EventDetailsModule)
  },
  {
    path: 'profile/:id',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/profile/profile.module').then(m => m.ProfileModule)
  },
  {
    path: 'pages',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/pages/pages.module').then(m => m.PagesModule)
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
