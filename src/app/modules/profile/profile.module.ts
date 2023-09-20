import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile.component';
import { LayoutComponent } from '../layout/layout.component';
import { TuiButtonModule, TuiSvgModule, TuiTextfieldControllerModule } from '@taiga-ui/core';
import { TuiAvatarModule, TuiInputModule } from '@taiga-ui/kit';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ProfileComponent
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    LayoutComponent,
    TuiSvgModule,
    TuiButtonModule,
    TuiInputModule,
    ReactiveFormsModule,
    TuiTextfieldControllerModule,
    TuiAvatarModule
  ]
})
export class ProfileModule { }
