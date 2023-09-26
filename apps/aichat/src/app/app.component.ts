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
  loading = false;
  constructor(private apiService: ApiService) {}

  onEnter(msg: string): void {
    console.log(msg);
    if (msg) {
      this.loading = true;
      this.aiResponse$ = this.apiService.postEndpoint(msg).pipe((msg) => {
        this.loading = false;
        return msg;
      });
    }
  }
}
