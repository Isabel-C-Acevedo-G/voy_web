import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forbidden',
  imports: [RouterLink],
  templateUrl: './forbidden.html',
  styleUrl: './forbidden.css',
  host: { class: 'block h-full min-h-0 overflow-y-auto' },
})
export class Forbidden {
  private readonly auth = inject(AuthService);
  readonly flash = this.auth.flash;
  readonly home = this.auth.homeForRole(this.auth.rol());
}
