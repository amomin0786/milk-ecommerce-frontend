import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  loading = false;
  err = '';
  success = '';

  showPassword = false;
  showForgotPassword = false;
  otpSent = false;
  resetting = false;

  form = {
    email: '',
    password: ''
  };

  forgot = {
    email: '',
    otp: '',
    newPassword: ''
  };

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  submit(): void {
    this.err = '';
    this.success = '';

    const email = String(this.form.email || '').trim();
    const password = String(this.form.password || '');

    if (!email) {
      this.err = 'Email is required';
      return;
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      this.err = 'Please enter a valid email address';
      return;
    }

    if (!password) {
      this.err = 'Password is required';
      return;
    }

    this.loading = true;

    this.auth.login({
      email,
      password
    }).subscribe({
      next: () => {
        // login પછી actual role backend /me થી લઇએ
        this.auth.me().subscribe({
          next: (user: any) => {
            this.loading = false;

            const role = this.normalizeRole(user?.role?.roleName || user?.role || '');

            if (role === 'ADMIN') {
              this.router.navigateByUrl('/admin/dashboard');
              return;
            }

            if (role === 'SELLER') {
              this.router.navigateByUrl('/seller/dashboard');
              return;
            }

            this.router.navigateByUrl('/');
          },
          error: () => {
            this.loading = false;
            this.err = 'Login success, but failed to load user profile';
          }
        });
      },
      error: (e: any) => {
        this.loading = false;
        this.err = e?.error?.message || e?.error || 'Login failed';
      }
    });
  }

  private normalizeRole(role: any): string {
    const raw = String(role || '').toUpperCase();
    return raw.startsWith('ROLE_') ? raw.replace('ROLE_', '') : raw;
  }

  sendOtp(): void {
    this.err = '';
    this.success = '';

    const email = String(this.forgot.email || '').trim();

    if (!email) {
      this.err = 'Email is required';
      return;
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      this.err = 'Please enter a valid email address';
      return;
    }

    this.resetting = true;

    this.auth.forgotPasswordSendOtp(email).subscribe({
      next: (res: any) => {
        this.resetting = false;
        this.otpSent = true;
        this.success = res?.message || 'OTP sent successfully';
      },
      error: (e: any) => {
        this.resetting = false;
        this.err = e?.error?.message || e?.error || 'Failed to send OTP';
      }
    });
  }

  resetPassword(): void {
    this.err = '';
    this.success = '';

    const email = String(this.forgot.email || '').trim();
    const otp = String(this.forgot.otp || '').trim();
    const newPassword = String(this.forgot.newPassword || '').trim();

    if (!email) {
      this.err = 'Email is required';
      return;
    }

    if (!otp) {
      this.err = 'OTP is required';
      return;
    }

    if (!newPassword) {
      this.err = 'New password is required';
      return;
    }

    this.resetting = true;

    this.auth.resetPasswordWithOtp(email, otp, newPassword).subscribe({
      next: (res: any) => {
        this.resetting = false;
        this.success = res?.message || 'Password reset successful';
        this.showForgotPassword = false;
        this.otpSent = false;
        this.forgot = {
          email: '',
          otp: '',
          newPassword: ''
        };
      },
      error: (e: any) => {
        this.resetting = false;
        this.err = e?.error?.message || e?.error || 'Failed to reset password';
      }
    });
  }

  toggleForgotPassword(): void {
    this.err = '';
    this.success = '';
    this.showForgotPassword = !this.showForgotPassword;

    if (!this.showForgotPassword) {
      this.otpSent = false;
      this.forgot = {
        email: '',
        otp: '',
        newPassword: ''
      };
    }
  }
}