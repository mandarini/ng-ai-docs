// api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'http://localhost:3333/api';

  constructor(private http: HttpClient) {}

  getEndpoint(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
