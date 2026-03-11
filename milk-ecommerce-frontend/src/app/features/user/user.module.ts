import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UserRoutingModule } from './user-routing.module';

import { MyOrdersComponent } from './pages/my-orders/my-orders.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { MyOrderDetailsComponent } from './pages/my-order-details/my-order-details.component';

@NgModule({
  declarations: [
    MyOrdersComponent,
    ProfileComponent,
    MyOrderDetailsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    UserRoutingModule
  ]
})
export class UserModule {}