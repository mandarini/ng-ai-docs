import { Component } from '@angular/core';
import { ApiService } from './ai.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'ng-ai-chat-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  aiResponse$: Observable<{ message: string }> | undefined;

  constructor(private apiService: ApiService) {}

  onEnter(msg: string): void {
    if (msg) {
      this.aiResponse$ = this.apiService.postEndpoint(msg);
    }
  }
}
