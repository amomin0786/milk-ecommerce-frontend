import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-sidebar',
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.scss']
})
export class AdminSidebarComponent {

  menu = [
    {
      label: 'Dashboard',
      route: '/admin/dashboard',
      icon: '📊'
    },
    {
      label: 'All Sellers',
      route: '/admin/sellers',
      icon: '🛒'
    },
    {
      label: 'Pending Sellers',
      route: '/admin/pending-sellers',
      icon: '⏳'
    },
    {
      label: 'Products',
      route: '/admin/products',
      icon: '📦'
    },
    {
      label: 'Orders',
      route: '/admin/orders',
      icon: '📑'
    },
    {
      label: 'Users',
      route: '/admin/users',
      icon: '👤'
    },
    {
      label: 'Reports',
      route: '/admin/reports',
      icon: '📈'
    }
  ];

}