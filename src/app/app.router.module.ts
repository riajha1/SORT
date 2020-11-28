import { PrintWordComponent } from './components/public/service-view/print-word/print-word.component';
import { ExcelComponent } from './components/shared/excel/excel.component';
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { HomeComponent } from './components/public/home/home.component';
import { ReportsComponent } from './components/admin/reports/reports.component';
import { DashboardComponent } from './components/public/dashboard/dashboard.component';
import { ServiceViewComponent } from './components/public/service-view/service-view.component';
import { DeliveryComponent } from './components/admin/administration/standard-content-categories/delivery/delivery.component';
import { ConsiderationsComponent } from './components/admin/administration/standard-content-categories/considerations/considerations.component';
import { NewServiceComponent } from './components/admin/complete-form/forms/new-service/new-service.component';
import { AdminHomeComponent } from './components/admin/administration/admin-home/admin-home.component';
import { ListServicesComponent } from './components/admin/complete-form/forms/in-process/list-of-services/list-service.component';
import { TreeComponent } from './components/public/service-view/independence-restrictions/tree/tree.component';
import { AuthComponent } from './auth/auth.component';
import { StandardContentLandingComponent } from './components/admin/administration/standard-content-categories/standard-content-landing/standard-content-landing.component';
import { SystemSetupLandingComponent } from './components/admin/administration/system-setup/system-setup-landing/system-setup-landing.component';
import { ServiceInventoryComponent } from './components/admin/service-inventory/service-inventory.component';
import { AdminUserAccessComponent } from './components/admin/administration/admin-user-access/admin-user-access.component';
import { LogoutComponent } from './components/shared/logout/logout.component';
import { IdleAutoLogComponent } from './components/shared/idle-auto-log/idle-auto-log.component';

import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'excel', component: ExcelComponent, canActivate: [AuthGuard] },
  { path: 'sam', component: NewServiceComponent, canActivate: [AuthGuard] },
  { path: 'sam/:idService', component: NewServiceComponent, canActivate: [AuthGuard] },
  { path: 'in-process', component: ListServicesComponent, canActivate: [AuthGuard] },
  { path: 'delivery', component: DeliveryComponent, canActivate: [AuthGuard] },
  { path: 'considerations', component: ConsiderationsComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'reports', component: ReportsComponent, canActivate: [AuthGuard] },
  { path: 'word', component: PrintWordComponent, canActivate: [AuthGuard] },
  {
    path: 'service/:id', component: ServiceViewComponent, canActivate: [AuthGuard], data: { path: 'service/:id' }
  },
  { path: 'permissibility-tree/:id', component: TreeComponent, canActivate: [AuthGuard] },
  { path: 'auth', component: AuthComponent },
  { path: 'administration', component: AdminHomeComponent, canActivate: [AuthGuard] },
  { path: 'standard-content', component: StandardContentLandingComponent },
  { path: 'system-setup', component: SystemSetupLandingComponent },
  { path: 'service-inventory', component: ServiceInventoryComponent},
  { path: 'user-access', component: AdminUserAccessComponent},
  { path: 'logout', component: LogoutComponent },
  { path: 'autologin', component: IdleAutoLogComponent },
  { path: '**', pathMatch: 'full', redirectTo: 'home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled', onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
