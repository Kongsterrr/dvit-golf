import { Routes } from '@angular/router';
import { HeroExplodeComponent } from './hero-explode/hero-explode.component';
import { FaceDeckStepComponent } from './customize/face-deck-step/face-deck-step.component';
import { CustomizerStepComponent } from './customize/customizer-step/customizer-step.component';

export const routes: Routes = [
  { path: '', component: HeroExplodeComponent },
  { path: 'putters', component: HeroExplodeComponent }, // temp
  { path: 'app', component: HeroExplodeComponent },      // temp
  { path: 'about', component: HeroExplodeComponent },    // temp
  // customizer
  {
    path: 'customize',
    children: [
        { path: ':step', component: CustomizerStepComponent }, 
        // { path: 'face-deck', component: FaceDeckStepComponent },      // future steps:
      // { path: 'connector', loadComponent: ... },
      // { path: 'weighting', loadComponent: ... },
      { path: '', pathMatch: 'full', redirectTo: 'face' },
    ]
  },
  { path: '**', redirectTo: '' }
];
