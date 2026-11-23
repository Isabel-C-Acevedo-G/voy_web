import { Injectable, signal } from '@angular/core';

export type AlertKind = 'info' | 'success' | 'warning' | 'error';

export interface AlertMessage {
  id: number;
  kind: AlertKind;
  text: string;
}

@Injectable({ providedIn: 'root' })
export class AlertService {
  private seq = 0;
  private readonly messagesSignal = signal<AlertMessage[]>([]);

  readonly messages = this.messagesSignal.asReadonly();

  show(text: string, kind: AlertKind = 'info', ms = 4000): void {
    const id = ++this.seq;
    this.messagesSignal.update((list) => [...list, { id, kind, text }]);
    window.setTimeout(() => this.dismiss(id), ms);
  }

  success(text: string): void {
    this.show(text, 'success');
  }

  error(text: string): void {
    this.show(text, 'error', 6000);
  }

  warning(text: string): void {
    this.show(text, 'warning', 5000);
  }

  dismiss(id: number): void {
    this.messagesSignal.update((list) => list.filter((m) => m.id !== id));
  }
}
