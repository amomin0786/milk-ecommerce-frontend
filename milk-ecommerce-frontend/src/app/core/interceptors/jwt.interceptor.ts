import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token'); // 👈 તમારી app માં જે key છે એ જ રાખો

    // login/register પર token ના લગાવવું
    const isAuthApi =
      req.url.includes('/api/users/login') ||
      req.url.includes('/api/users/register');

    if (token && !isAuthApi) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }

    return next.handle(req);
  }
}