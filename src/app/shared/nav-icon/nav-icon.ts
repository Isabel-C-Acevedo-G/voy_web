import { Component, input } from '@angular/core';

export type NavIconName =
  | 'home'
  | 'bike'
  | 'calendar'
  | 'user'
  | 'grid'
  | 'login'
  | 'logout'
  | 'alert'
  | 'note'
  | 'users'
  | 'chart';

@Component({
  selector: 'app-nav-icon',
  imports: [],
  templateUrl: './nav-icon.html',
  styleUrl: './nav-icon.css',
  host: {
    class: 'inline-flex shrink-0 text-current',
    'aria-hidden': 'true',
  },
})
export class NavIcon {
  readonly name = input.required<NavIconName>();
}
