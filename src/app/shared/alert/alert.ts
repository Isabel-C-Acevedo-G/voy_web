import { Component, inject } from '@angular/core';

import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-alert',
  imports: [],
  templateUrl: './alert.html',
  styleUrl: './alert.css',
})
export class Alert {
  readonly alerts = inject(AlertService);

  dismiss(id: number): void {
    this.alerts.dismiss(id);
  }
}
