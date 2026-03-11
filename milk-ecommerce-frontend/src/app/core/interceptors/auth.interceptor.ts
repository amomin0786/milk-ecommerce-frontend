import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('milk_token');

    const isPublicAuthRoute =
      req.url.includes('/api/users/login') ||
      req.url.includes('/api/users/register') ||
      req.url.includes('/api/auth/forgot-password/send-otp') ||
      req.url.includes('/api/auth/forgot-password/reset');

    if (!token || isPublicAuthRoute) {
      return next.handle(req);
    }

    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next.handle(authReq);
  }
}