import { Component, OnInit } from '@angular/core';
import { ApiService } from './ai.service';

@Component({
  selector: 'ng-ai-chat-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  message = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getEndpoint().subscribe(
      (data) => {
        this.message = data.message;
      },
      (error) => {
        console.error('Error:', error);
      }
    );
  }
}
