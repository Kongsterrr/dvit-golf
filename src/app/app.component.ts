import { Component } from '@angular/core';
import { HeroExplodeComponent } from './hero-explode/hero-explode.component';
import { HeaderComponent } from './header/header.component';
import { RouterModule, RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, RouterModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {}
