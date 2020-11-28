import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { MalihuScrollbarModule } from 'ngx-malihu-scrollbar';
import {NgbPaginationModule} from '@ng-bootstrap/ng-bootstrap';
import { SlickCarouselModule } from 'ngx-slick-carousel';

import { ServiceViewModule } from './service-view/service-view.module';

import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { GridComponent } from './dashboard/grid/grid.component';
import { FinanceModalComponent } from './dashboard/grid/finance-modal/finance-modal.component';
import { CollapseFilterComponent } from './dashboard/collapse-filter/collapse-filter.component';
import { PermissibilityIconComponent } from './dashboard/grid/permissibility-icon/permissibility-icon.component';
import { CarouselComponent } from './home/carousel/carousel.component';

import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    HomeComponent,
    DashboardComponent,
    GridComponent,
    CollapseFilterComponent,
    FinanceModalComponent,
    CarouselComponent,
    PermissibilityIconComponent
  ],
  imports: [
    RouterModule,
    CommonModule,
    ServiceViewModule,
    SharedModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgbPaginationModule,
    SlickCarouselModule,
    MalihuScrollbarModule.forRoot()
  ],
  providers: [ ],
  entryComponents: [FinanceModalComponent]
})
export class PublicModule { }
