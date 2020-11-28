import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MalihuScrollbarModule } from 'ngx-malihu-scrollbar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgSelectModule } from '@ng-select/ng-select';
import { MaterialModule } from '../../material.module';
import { RouterModule } from '@angular/router';
import { AdministrationModule } from './administration/administration.module';


import { CompleteFormModule } from './complete-form/complete-form.module';
import { SharedModule } from '../shared/shared.module';
import { ReportsComponent } from './reports/reports.component';
import { ServiceInventoryComponent } from './service-inventory/service-inventory.component';
import { DualListInventoryComponent } from './service-inventory/dual-list-inventory/dual-list-inventory.component';

@NgModule({
  declarations: [
    ReportsComponent,
    ServiceInventoryComponent,
    DualListInventoryComponent,
     ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CKEditorModule,
    NgSelectModule,
    MaterialModule,
    SharedModule,
    CompleteFormModule,
    AdministrationModule,
    RouterModule,
    MalihuScrollbarModule.forRoot()
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ]
})
export class AdminModule { }
