import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NewsletterService {

  private api = `${environment.apiBaseUrl}/api/newsletter`;

  constructor(private http: HttpClient) {}

  subscribe(email: string) {
    return this.http.post(`${this.api}/subscribe`, { email });
  }

}