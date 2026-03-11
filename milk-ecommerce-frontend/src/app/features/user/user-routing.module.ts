import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MyOrdersComponent } from './pages/my-orders/my-orders.component';
import { MyOrderDetailsComponent } from './pages/my-order-details/my-order-details.component';
import { ProfileComponent } from './pages/profile/profile.component';

const routes: Routes = [
  { path: 'profile', component: ProfileComponent },
  { path: 'my-orders', component: MyOrdersComponent },
  { path: 'my-orders/:id', component: MyOrderDetailsComponent },
  { path: '', redirectTo: 'profile', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule {}