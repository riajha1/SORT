import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { MaterialModule } from '../../../material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgSelectModule } from '@ng-select/ng-select';

import { AdminHomeComponent } from './admin-home/admin-home.component';
import { StandardContentLandingComponent } from './standard-content-categories/standard-content-landing/standard-content-landing.component';
import { StandardDeliveryComponent } from './standard-content-categories/standard-delivery/standard-delivery.component';
import { StandardConsiderationsComponent } from './standard-content-categories/standard-considerations/standard-considerations.component';

import { SystemSetupLandingComponent } from './system-setup/system-setup-landing/system-setup-landing.component';
import { ActiveGlobalComponent } from './system-setup/active-global/active-global.component';
import { ConsiderationsComponent } from './standard-content-categories/considerations/considerations.component';
import { DeliveryComponent } from './standard-content-categories/delivery/delivery.component';
import { AdminUserAccessComponent } from './admin-user-access/admin-user-access.component';
import { CompleteFormModule } from '../complete-form/complete-form.module';
import { AdminPeoplePickerComponent } from './admin-user-access/admin-people-picker/admin-people-picker.component';

@NgModule({
  declarations: [
    AdminHomeComponent,
    StandardContentLandingComponent,
    StandardDeliveryComponent,
    StandardConsiderationsComponent,
    SystemSetupLandingComponent,
    ActiveGlobalComponent,
    ConsiderationsComponent,
    DeliveryComponent,
    AdminUserAccessComponent,
    AdminPeoplePickerComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    CKEditorModule,
    NgSelectModule,
   CompleteFormModule
  ],
  entryComponents: [],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ]
})
export class AdministrationModule { }
