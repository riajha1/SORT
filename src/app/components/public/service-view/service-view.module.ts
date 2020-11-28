import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MaterialModule } from '../../../material.module';
import { RouterModule } from '@angular/router';

import { ServiceViewComponent } from './service-view.component';
import { LocationModalComponent } from './location-modal/location-modal.component';
import { ModalServiceComponent } from './default-modal/modal.component';
import { ModalContactComponent } from './contact-modal/modal-contact.component';
import { OtherConsiderationComponent } from './other-consideration/other-consideration.component';
import { ConflictsConsiderationComponent } from './conflicts-consideration/conflicts-consideration.component';
import { ServiceGuidanceComponent } from './service-guidance/service-guidance.component';
import { EyTechnologyComponent } from './ey-technology/ey-technology.component';
import { IndependenceConsiderationComponent } from './independence-consideration/independence-consideration.component';
import { DeliveryMethodComponent } from './delivery-method/delivery-method.component';
import { IndependenceRestrictionsComponent } from './independence-restrictions/independence-restrictions.component';
import { HeaderComponent } from './header/header.component';
import { CountryConsiderationsComponent } from './country-considerations/country-considerations.component';
import { PrintComponent } from './print/print.component';
import { PrintWordComponent } from './print-word/print-word.component';
import { IndependenceRestrictionsExcelComponent } from './independence-restrictions-excel/independence-restrictions-excel.component';
import { PermissibilityComponent } from './independence-restrictions/permissibility-icons/permissibility-icons.component';
import { TreeComponent } from './independence-restrictions/tree/tree.component';
@NgModule({
  declarations: [
    ServiceViewComponent,
    LocationModalComponent,
    OtherConsiderationComponent,
    ConflictsConsiderationComponent,
    ServiceGuidanceComponent,
    EyTechnologyComponent,
    IndependenceConsiderationComponent,
    IndependenceRestrictionsExcelComponent,
    DeliveryMethodComponent,
    IndependenceRestrictionsComponent,
    HeaderComponent,
    CountryConsiderationsComponent,
    PrintComponent,
    ModalServiceComponent,
    ModalContactComponent,
    PrintWordComponent,
    PermissibilityComponent,
    IndependenceRestrictionsExcelComponent,
    TreeComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MatTooltipModule,
    MaterialModule,
    RouterModule
  ],
  entryComponents: [
    LocationModalComponent,
    ModalServiceComponent,
    ModalContactComponent]
})
export class ServiceViewModule { }
