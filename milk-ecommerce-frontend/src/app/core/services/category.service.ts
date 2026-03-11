import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface CategoryPayload {
  categoryName: string;
  status?: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/categories`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  addCategory(body: CategoryPayload): Observable<any> {
    return this.http.post<any>(this.baseUrl, body);
  }

  updateCategory(id: number, body: CategoryPayload): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, body);
  }

  deleteCategory(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
  }
}