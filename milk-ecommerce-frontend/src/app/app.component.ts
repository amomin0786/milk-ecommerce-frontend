import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  title = 'milk-ecommerce-frontend';
  currentUrl = '';

  constructor(
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUrl = this.router.url;

    // app start / refresh પર enforce
    this.enforceRoleLanding(this.currentUrl);

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentUrl = event.urlAfterRedirects || event.url || '';
        this.enforceRoleLanding(this.currentUrl);
      });
  }

  isPanelRoute(): boolean {
    return this.currentUrl.startsWith('/admin') || this.currentUrl.startsWith('/seller');
  }

  private enforceRoleLanding(url: string): void {
    if (!this.auth.isLoggedIn()) {
      return;
    }

    this.auth.me().subscribe({
      next: (user: any) => {
        const role = this.normalizeRole(user?.role?.roleName || user?.role || '');

        // seller/admin public pages access ના કરે
        const isPublicRoute =
          url === '/' ||
          url.startsWith('/about') ||
          url.startsWith('/login') ||
          url.startsWith('/register') ||
          url.startsWith('/shop') ||
          url.startsWith('/public');

        if (role === 'ADMIN') {
          if (!url.startsWith('/admin') && !url.startsWith('/user/profile')) {
            this.router.navigateByUrl('/admin/dashboard');
          }
          return;
        }

        if (role === 'SELLER') {
          if (!url.startsWith('/seller') && !url.startsWith('/user/profile')) {
            this.router.navigateByUrl('/seller/dashboard');
          }
          return;
        }

        // USER માટે public routes allowed
      },
      error: () => {
        // ignore
      }
    });
  }

  private normalizeRole(role: any): string {
    const raw = String(role || '').toUpperCase();
    return raw.startsWith('ROLE_') ? raw.replace('ROLE_', '') : raw;
  }
}