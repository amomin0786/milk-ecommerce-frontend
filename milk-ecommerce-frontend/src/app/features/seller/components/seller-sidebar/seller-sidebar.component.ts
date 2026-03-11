import { Component } from '@angular/core';

@Component({
  selector: 'app-seller-sidebar',
  templateUrl: './seller-sidebar.component.html',
  styleUrls: ['./seller-sidebar.component.scss']
})
export class SellerSidebarComponent {

  menu = [
    {
      label: 'Dashboard',
      route: '/seller/dashboard',
      icon: '📊'
    },
    {
      label: 'Products',
      route: '/seller/products',
      icon: '📦'
    },
    {
      label: 'Orders',
      route: '/seller/orders',
      icon: '📑'
    },
    {
      label: 'Reports',
      route: '/seller/reports',
      icon: '📈'
    },
    {
      label: 'Add Product',
      route: '/seller/products/add',
      icon: '➕'
    }
  ];

}