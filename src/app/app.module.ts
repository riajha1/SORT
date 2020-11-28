import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// router
import { AppRoutingModule } from './app.router.module';

// components
import { AppComponent } from './app.component';
import { AuthComponent } from './auth/auth.component';
// modules
import { SharedModule } from './components/shared/shared.module';
import { ProviderModule } from './providers/provider.module';
import { AdminModule } from './components/admin/admin.module';
import { PublicModule } from './components/public/public.module';
import { AuthInterceptorService } from './auth/auth-interceptor.service';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';


@NgModule({
  declarations: [
    AppComponent,
    AuthComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    ProviderModule,
    AdminModule,
    SharedModule,
    PublicModule,
    NgIdleKeepaliveModule.forRoot(),
  ],
  providers: [{provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true}],
  bootstrap: [AppComponent]
})
export class AppModule { }
