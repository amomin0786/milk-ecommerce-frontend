import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SellerRoutingModule } from './seller-routing.module';
import { SellerDashboardComponent } from './pages/seller-dashboard/seller-dashboard.component';
import { SellerProductsComponent } from './pages/seller-products/seller-products.component';
import { AddProductComponent } from './pages/add-product/add-product.component';
import { SellerOrdersComponent } from './pages/seller-orders/seller-orders.component';
import { SellerApplyComponent } from './seller-apply/seller-apply.component';
import { SellerReportsComponent } from './pages/seller-reports/seller-reports.component';
import { SellerSidebarComponent } from './components/seller-sidebar/seller-sidebar.component';

@NgModule({
  declarations: [
    SellerDashboardComponent,
    SellerProductsComponent,
    AddProductComponent,
    SellerOrdersComponent,
    SellerApplyComponent,
    SellerReportsComponent,
    SellerSidebarComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SellerRoutingModule
  ]
})
export class SellerModule {}