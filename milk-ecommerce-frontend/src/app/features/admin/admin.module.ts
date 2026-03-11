import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdminRoutingModule } from './admin-routing.module';

import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { AdminOrdersComponent } from './pages/admin-orders/admin-orders.component';
import { AdminProductsComponent } from './pages/admin-products/admin-products.component';
import { UsersComponent } from './pages/users/users.component';
import { PendingSellersComponent } from './pages/pending-sellers/pending-sellers.component';
import { CategoriesComponent } from './pages/categories/categories.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { AdminSellersComponent } from './admin-sellers/admin-sellers.component';
import { AdminSidebarComponent } from './components/admin-sidebar/admin-sidebar.component';

@NgModule({
  declarations: [
    AdminDashboardComponent,
    AdminOrdersComponent,
    AdminProductsComponent,
    UsersComponent,
    PendingSellersComponent,
    CategoriesComponent,
    ReportsComponent,
    AdminSellersComponent,
    AdminSidebarComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }