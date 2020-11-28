import { IdleAutoLogComponent } from './idle-auto-log/idle-auto-log.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { MalihuScrollbarModule } from 'ngx-malihu-scrollbar';

import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { ReadMoreComponent } from './read-more/read-more.component';
import { LoadingComponent } from './loading/loading.component';
import { ModalNavbarComponent } from './navbar/modal/modal.component';

import { DomseguroPipe } from '../../pipes/domseguro.pipe';
import { SafehtmlPipe } from 'src/app/pipes/safehtml.pipe';
import { HighlightDirective } from 'src/app/directives/highlight.directive';
import { ScrollerDirective } from 'src/app/directives/prevent-scroll.directive';

import { ModalComponent } from './modal/modal.component';
import { ExcelComponent } from './excel/excel.component';
import { FavoritesComponent } from './navbar/favorites/favorites.component';
import { AutocompleteComponent } from './navbar/autocomplete/autocomplete.component';
import { ImpersonationComponent } from './impersonation/impersonation.component';
import { LogoutComponent } from './logout/logout.component';


@NgModule({
  declarations: [
    NavbarComponent,
    FooterComponent,
    ReadMoreComponent,
    LoadingComponent,
    ModalNavbarComponent,
    DomseguroPipe,
    SafehtmlPipe,
    HighlightDirective,
    ScrollerDirective,
    ModalComponent,
    ExcelComponent,
    FavoritesComponent,
    AutocompleteComponent,
    ImpersonationComponent,
    LogoutComponent,
    IdleAutoLogComponent
  ],
  exports: [
    NavbarComponent,
    FooterComponent,
    ReadMoreComponent,
    LoadingComponent,
    ModalNavbarComponent,
    SafehtmlPipe,
    HighlightDirective,
    ModalComponent,
    ExcelComponent,
    ImpersonationComponent,
    IdleAutoLogComponent
  ],
  imports: [
    RouterModule,
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    MalihuScrollbarModule.forRoot()
  ],
  entryComponents: [ModalNavbarComponent]
})
export class SharedModule { }
