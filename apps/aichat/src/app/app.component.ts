import { Component, OnInit } from '@angular/core';
import { ApiService } from './ai.service';

@Component({
  selector: 'ng-ai-chat-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  message$ = this.apiService.postEndpoint('what is angular?');

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.message$.subscribe((data) => {
      console.log('data', data);
    });
  }
}
