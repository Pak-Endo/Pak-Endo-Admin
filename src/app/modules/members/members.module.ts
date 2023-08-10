import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MembersRoutingModule } from './members-routing.module';
import { MembersComponent } from './members.component';
import { LayoutComponent } from '../layout/layout.component';
import { TuiDataListWrapperModule, TuiInputModule, TuiInputPhoneInternationalModule, TuiPaginationModule, TuiRadioBlockModule, TuiSelectModule } from '@taiga-ui/kit';
import { TuiButtonModule, TuiGroupModule, TuiLoaderModule, TuiTextfieldControllerModule } from '@taiga-ui/core';
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
    TuiLoaderModule,
    TuiDataListWrapperModule,
    TuiSelectModule,
    TuiInputPhoneInternationalModule,
    TuiRadioBlockModule,
    TuiGroupModule
  ]
})
export class MembersModule { }
