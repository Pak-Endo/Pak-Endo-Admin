import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MembersRoutingModule } from './members-routing.module';
import { MembersComponent } from './members.component';
import { LayoutComponent } from '../layout/layout.component';
import { TuiInputModule, TuiPaginationModule } from '@taiga-ui/kit';
import { TuiButtonModule, TuiLoaderModule, TuiTextfieldControllerModule } from '@taiga-ui/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    MembersComponent
  ],
  imports: [
    CommonModule,
    MembersRoutingModule,
    LayoutComponent,
    TuiInputModule,
    TuiTextfieldControllerModule,
    ReactiveFormsModule,
    FormsModule,
    TuiPaginationModule,
    TuiButtonModule,
    TuiLoaderModule
  ]
})
export class MembersModule { }
