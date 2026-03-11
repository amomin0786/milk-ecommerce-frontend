import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from 'src/app/shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user$ = new BehaviorSubject<User | null>(null);
  user$ = this._user$.asObservable();

  private readonly usersBaseUrl = `${environment.apiBaseUrl}/api/users`;
  private readonly authBaseUrl = `${environment.apiBaseUrl}/api/auth`;

  constructor(private http: HttpClient) {}

  get token(): string {
    return localStorage.getItem('milk_token') || '';
  }

  isLoggedIn(): boolean {
    return !!this.token;
  }

  login(body: { email: string; password: string }): Observable<string> {
    return this.http.post(
      `${this.usersBaseUrl}/login`,
      body,
      { responseType: 'text' }
    ).pipe(
      tap((token: string) => localStorage.setItem('milk_token', token))
    );
  }

  register(body: any): Observable<User> {
    return this.http.post<User>(
      `${this.usersBaseUrl}/register`,
      body
    );
  }

  me(): Observable<User> {
    return this.http.get<User>(`${this.usersBaseUrl}/me`).pipe(
      tap(user => this._user$.next(user))
    );
  }

  updateProfile(body: { name: string; phone?: string; address?: string }): Observable<User> {
    return this.http.put<User>(`${this.usersBaseUrl}/profile`, body).pipe(
      tap(user => this._user$.next(user))
    );
  }

  changePassword(body: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Observable<string> {
    return this.http.put(
      `${this.usersBaseUrl}/change-password`,
      body,
      { responseType: 'text' }
    );
  }

  forgotPasswordSendOtp(email: string): Observable<any> {
    return this.http.post<any>(`${this.authBaseUrl}/forgot-password/send-otp`, {
      email
    });
  }

  resetPasswordWithOtp(email: string, otp: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.authBaseUrl}/forgot-password/reset`, {
      email,
      otp,
      newPassword
    });
  }

  logout(): void {
    localStorage.removeItem('milk_token');
    this._user$.next(null);
  }
}