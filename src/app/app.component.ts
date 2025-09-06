import { Component } from '@angular/core';
import { HeroExplodeComponent } from './hero-explode/hero-explode.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeroExplodeComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {}
