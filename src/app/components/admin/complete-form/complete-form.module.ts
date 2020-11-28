import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { MaterialModule } from '../../../material.module';
import { MalihuScrollbarModule } from 'ngx-malihu-scrollbar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgSelectModule } from '@ng-select/ng-select';

import { LocationComponent } from './forms/new-service/location/location.component';
import { IntakeComponent } from './forms/new-service/service-detail/intake.component';
import { BusinessContactsComponent } from './forms/new-service/business-contacts/business-contacts.component';
import { PermissibilityComponent } from './forms/new-service/permissibility/permissibility.component';
import { QualityIndependenceContactsComponent } from './forms/new-service/quality-independence-contacts/quality-independence-contacts.component';
import { ConflictConsiderationComponent } from './forms/new-service/conflict-consideration/conflict-consideration.component';
import { IndependenceConsiderationComponent } from './forms/new-service/independence-consideration/independence-consideration.component';
import { GuidanceComponent } from './forms/new-service/guidance/guidance.component';
import { EyTechnologyComponent } from './forms/new-service/ey-technology/ey-technology.component';
import { OtherComponent } from './forms/new-service/other/other.component';
import { NewServiceComponent } from './forms/new-service/new-service.component';
import { PublishComponent } from './forms/new-service/publish-service/publish.component';

// shared components
import { TreeTextareaComponent } from './shared/tree-textarea/tree-textarea.component';
import { PeoplePickerComponent } from './shared/people-picker/people-picker.component';
import { TreeModalComponent } from './shared/tree-modal/tree-modal.component';
import { ProgressComponent } from './shared/sidebar/progress/progress.component';
import { ModalTreeComponent } from './shared/tree-modal/modal-contact/modal-contact.component';
import { GreyBarComponent } from './shared/grey-bar/grey-bar.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { ListServicesComponent } from './forms/in-process/list-of-services/list-service.component';
import { TreePublishComponent } from './shared/tree-publish/tree-publish.component';
import { FormComponent } from './shared/tree-publish/form/form.component';
import { FormRegionComponent } from './shared/tree-publish/form-region/form-region.component';


@NgModule({
  declarations: [
    LocationComponent,
    SidebarComponent,
    IntakeComponent,
    ProgressComponent,
    BusinessContactsComponent,
    PermissibilityComponent,
    QualityIndependenceContactsComponent,
    ConflictConsiderationComponent,
    IndependenceConsiderationComponent,
    PublishComponent,
    GuidanceComponent,
    EyTechnologyComponent,
    TreeTextareaComponent,
    PeoplePickerComponent,
    TreeModalComponent,
    OtherComponent,
    ModalTreeComponent,
    GreyBarComponent,
    NewServiceComponent,
    ListServicesComponent,
    TreePublishComponent,
    FormComponent,
    FormRegionComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    CKEditorModule,
    NgSelectModule,
    MalihuScrollbarModule.forRoot()
  ],
  entryComponents: [ModalTreeComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ]
})
export class CompleteFormModule { }
