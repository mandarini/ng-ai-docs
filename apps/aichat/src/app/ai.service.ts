import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'http://localhost:3333/api';

  constructor(private http: HttpClient) {}

  postEndpoint(data: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      this.apiUrl,
      { query: data },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
