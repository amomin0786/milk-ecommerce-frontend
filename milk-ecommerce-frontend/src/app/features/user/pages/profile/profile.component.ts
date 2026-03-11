import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { User } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  loading = false;
  saving = false;
  passwordSaving = false;

  error = '';
  success = '';
  passwordError = '';
  passwordSuccess = '';

  user: User | null = null;

  profileForm = {
    name: '',
    phone: '',
    address: ''
  };

  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.error = '';

    this.auth.me().subscribe({
      next: (user) => {
        this.user = user;
        this.profileForm.name = user?.name || '';
        this.profileForm.phone = user?.phone || '';
        this.profileForm.address = user?.address || '';
        this.loading = false;
      },
      error: (err) => {
        this.error = this.getErrorMessage(err, 'Failed to load profile');
        this.loading = false;
      }
    });
  }

  saveProfile(): void {
    this.error = '';
    this.success = '';

    if (!this.profileForm.name.trim()) {
      this.error = 'Name is required';
      return;
    }

    this.saving = true;

    this.auth.updateProfile({
      name: this.profileForm.name,
      phone: this.profileForm.phone,
      address: this.profileForm.address
    }).subscribe({
      next: (user) => {
        this.user = user;
        this.success = 'Profile updated successfully';
        this.saving = false;
      },
      error: (err) => {
        this.error = this.getErrorMessage(err, 'Failed to update profile');
        this.saving = false;
      }
    });
  }

  changePassword(): void {
    this.passwordError = '';
    this.passwordSuccess = '';

    if (!this.passwordForm.currentPassword.trim()) {
      this.passwordError = 'Current password is required';
      return;
    }

    if (!this.passwordForm.newPassword.trim()) {
      this.passwordError = 'New password is required';
      return;
    }

    if (!this.passwordForm.confirmPassword.trim()) {
      this.passwordError = 'Confirm password is required';
      return;
    }

    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.passwordError = 'New password and confirm password do not match';
      return;
    }

    if (this.passwordForm.newPassword.length < 6) {
      this.passwordError = 'New password must be at least 6 characters';
      return;
    }

    this.passwordSaving = true;

    this.auth.changePassword({
      currentPassword: this.passwordForm.currentPassword,
      newPassword: this.passwordForm.newPassword,
      confirmPassword: this.passwordForm.confirmPassword
    }).subscribe({
      next: () => {
        this.passwordSuccess = 'Password changed successfully';
        this.passwordForm = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        this.passwordSaving = false;
      },
      error: (err) => {
        console.error('Change password error:', err);
        this.passwordError = this.getErrorMessage(err, 'Failed to change password');
        this.passwordSaving = false;
      }
    });
  }

  private getErrorMessage(err: any, fallback: string = 'Something went wrong'): string {
    if (!err) return fallback;

    if (typeof err.error === 'string') return err.error;
    if (err.error?.message) return err.error.message;
    if (err.error?.error) return err.error.error;
    if (err.message) return err.message;

    return fallback;
  }
  
}