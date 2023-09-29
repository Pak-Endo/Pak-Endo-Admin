import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GuiGridModule } from '@generic-ui/ngx-grid';

import { MembersRoutingModule } from './members-routing.module';
import { MembersComponent } from './members.component';
import { LayoutComponent } from '../layout/layout.component';
import { TuiDataListWrapperModule, TuiInputModule, TuiInputPhoneInternationalModule, TuiPaginationModule, TuiRadioBlockModule, TuiSelectModule, TuiTextAreaModule } from '@taiga-ui/kit';
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
    TuiGroupModule,
    GuiGridModule,
    TuiTextAreaModule
  ]
})
export class MembersModule { }
