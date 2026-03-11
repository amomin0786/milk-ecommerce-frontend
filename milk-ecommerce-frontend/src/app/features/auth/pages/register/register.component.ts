import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  loading = false;
  msg = '';
  err = '';
  showPassword = false;

  touched = {
    name: false,
    email: false,
    password: false,
    phone: false,
    address: false
  };

  form = {
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  };

  constructor(private auth: AuthService, private router: Router) {}

  get nameValue(): string {
    return (this.form.name || '').trim();
  }

  get emailValue(): string {
    return (this.form.email || '').trim().toLowerCase();
  }

  get passwordValue(): string {
    return (this.form.password || '').trim();
  }

  get phoneValue(): string {
    return (this.form.phone || '').trim();
  }

  get addressValue(): string {
    return (this.form.address || '').trim();
  }

  get nameError(): string {
    const name = this.nameValue;

    if (!name) {
      return 'Name is required';
    }

    if (name.length < 3) {
      return 'Name must be at least 3 characters';
    }

    return '';
  }

  get emailError(): string {
    const email = this.emailValue;

    if (!email) {
      return 'Email is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Enter a valid email address';
    }

    return '';
  }

  get passwordError(): string {
    const password = this.passwordValue;

    if (!password) {
      return 'Password is required';
    }

    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }

    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least 1 uppercase letter';
    }

    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least 1 lowercase letter';
    }

    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least 1 number';
    }

    if (!/[!@#$%^&*(),.?":{}|<>_\-\\/\[\];'+=~`]/.test(password)) {
      return 'Password must contain at least 1 special character';
    }

    return '';
  }

  get phoneError(): string {
    const phone = this.phoneValue;

    if (!phone) {
      return 'Phone is required';
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return 'Phone must be exactly 10 digits';
    }

    return '';
  }

  get addressError(): string {
    const address = this.addressValue;

    if (!address) {
      return 'Address is required';
    }

    if (address.length < 5) {
      return 'Address must be at least 5 characters';
    }

    return '';
  }

  get isFormValid(): boolean {
    return !this.nameError &&
      !this.emailError &&
      !this.passwordError &&
      !this.phoneError &&
      !this.addressError;
  }

  markAllTouched(): void {
    this.touched.name = true;
    this.touched.email = true;
    this.touched.password = true;
    this.touched.phone = true;
    this.touched.address = true;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
      'Home',
      'End'
    ];

    if (allowedKeys.includes(event.key)) {
      return;
    }

    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  sanitizePhoneInput(): void {
    this.form.phone = (this.form.phone || '').replace(/\D/g, '').slice(0, 10);
  }

  submit(): void {
    this.msg = '';
    this.err = '';
    this.markAllTouched();

    this.form.name = this.nameValue;
    this.form.email = this.emailValue;
    this.form.password = this.passwordValue;
    this.form.phone = this.phoneValue;
    this.form.address = this.addressValue;

    if (!this.isFormValid) {
      this.err = 'Please fix the validation errors';
      return;
    }

    this.loading = true;

    this.auth.register(this.form).subscribe({
      next: () => {
        this.loading = false;
        this.msg = 'Registered successfully ✅ Please login.';
        setTimeout(() => this.router.navigateByUrl('/login'), 400);
      },
      error: (e) => {
        this.loading = false;
        this.err =
          typeof e?.error === 'string'
            ? e.error
            : (e?.error?.message || 'Register failed (email may already exist)');
      }
    });
  }
}