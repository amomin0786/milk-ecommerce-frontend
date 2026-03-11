import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SellerDashboardComponent } from './pages/seller-dashboard/seller-dashboard.component';
import { SellerProductsComponent } from './pages/seller-products/seller-products.component';
import { AddProductComponent } from './pages/add-product/add-product.component';
import { SellerOrdersComponent } from './pages/seller-orders/seller-orders.component';
import { SellerApplyComponent } from './seller-apply/seller-apply.component';
import { SellerReportsComponent } from './pages/seller-reports/seller-reports.component';

const routes: Routes = [
  { path: 'dashboard', component: SellerDashboardComponent },
  { path: 'apply', component: SellerApplyComponent },
  { path: 'products', component: SellerProductsComponent },
  { path: 'products/add', component: AddProductComponent },
  { path: 'products/edit/:id', component: AddProductComponent },
  { path: 'orders', component: SellerOrdersComponent },
  { path: 'reports', component: SellerReportsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SellerRoutingModule {}