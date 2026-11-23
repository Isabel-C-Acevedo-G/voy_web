import { Component, input } from '@angular/core';

@Component({
  selector: 'app-coming-soon',
  imports: [],
  templateUrl: './coming-soon.html',
  styleUrl: './coming-soon.css',
})
export class ComingSoon {
  /** withComponentInputBinding mapea route.data['title'] → title */
  readonly title = input('Próximamente');
}
