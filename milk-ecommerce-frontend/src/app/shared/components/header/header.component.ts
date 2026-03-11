import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth.service';
import { User } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  open = false;
  user: User | null = null;
  currentUrl = '';

  logoUrl = 'assets/images/logo0.png';
  logoFailed = false;

  constructor(public auth: AuthService, private router: Router) {
    this.auth.user$.subscribe(u => (this.user = u));

    if (this.auth.isLoggedIn()) {
      this.auth.me().subscribe({
        next: (u) => {
          this.user = u;
        },
        error: () => {
          this.user = null;
        }
      });
    }

    this.currentUrl = this.router.url;
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentUrl = event.urlAfterRedirects || event.url || '';
        this.close();

        if (this.auth.isLoggedIn() && !this.user) {
          this.auth.me().subscribe({
            next: (u) => {
              this.user = u;
            },
            error: () => {
              this.user = null;
            }
          });
        }
      });
  }

  toggle(): void {
    this.open = !this.open;
  }

  close(): void {
    this.open = false;
  }

  onLogoError(): void {
    this.logoFailed = true;
  }

  get role(): string {
    const rn = (this.user as any)?.role?.roleName || (this.user as any)?.role || '';
    return typeof rn === 'string' ? rn : '';
  }

  private normalizeRole(r: string): string {
    return (r || '').replace('ROLE_', '').toUpperCase();
  }

  get isUser(): boolean {
    return this.normalizeRole(this.role) === 'USER';
  }

  get isSeller(): boolean {
    return this.normalizeRole(this.role) === 'SELLER';
  }

  get isAdmin(): boolean {
    return this.normalizeRole(this.role) === 'ADMIN';
  }

  get roleLabel(): string {
    const r = this.normalizeRole(this.role);
    return r || 'USER';
  }

  get isAdminRoute(): boolean {
    return this.currentUrl.startsWith('/admin');
  }

  get isSellerRoute(): boolean {
    return this.currentUrl.startsWith('/seller');
  }

  get isUserProfileRoute(): boolean {
    return this.currentUrl.startsWith('/user/profile');
  }

  get shouldUsePanelHeader(): boolean {
    if (this.isAdminRoute || this.isSellerRoute) {
      return true;
    }

    if (this.isUserProfileRoute && (this.isAdmin || this.isSeller)) {
      return true;
    }

    return false;
  }

  get panelHomeLink(): string {
    if (this.isAdmin) {
      return '/admin/dashboard';
    }

    if (this.isSeller) {
      return '/seller/dashboard';
    }

    return '/';
  }

  get canShowCart(): boolean {
    return this.auth.isLoggedIn() && this.isUser;
  }

  logout(): void {
    this.auth.logout();
    this.user = null;
    this.close();
    this.router.navigateByUrl('/');
  }
}