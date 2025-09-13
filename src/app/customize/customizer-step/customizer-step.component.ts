// src/app/customize/customizer-step/customizer-step.component.ts
import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { STEPS, StepConfig, StepKey } from '../steps.config';
import { CustomizerService } from '../customizer.service';
import { map, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  standalone: true,
  selector: 'app-customizer-step',
  imports: [CommonModule, RouterModule],
  templateUrl: './customizer-step.component.html',
  styleUrls: ['./customizer-step.component.scss'],
})
export class CustomizerStepComponent {
  private route = inject(ActivatedRoute);
  private svc = inject(CustomizerService);

  private readonly DEFAULT_STEP: StepKey = 'face';

  // Live step key (always a definite StepKey)
  stepKey = signal<StepKey>(this.DEFAULT_STEP);

  // Selected id for the current step
  selectedId = signal<string>(this.svc.getSelected(this.DEFAULT_STEP));

  // Derive config & current selected option
  config  = computed<StepConfig>(() => STEPS[this.stepKey()]);
  selected = computed(() => this.config().options.find(o => o.id === this.selectedId())!);

  // Back/Next labels/targets
  backTo    = computed<StepKey | undefined>(() => this.config().backTo);
  nextTo    = computed<StepKey | undefined>(() => this.config().nextTo);
  backTitle = computed(() => this.backTo() ? STEPS[this.backTo()!].title : '');
  nextTitle = computed(() => this.nextTo() ? STEPS[this.nextTo()!].title : '');

  constructor() {
    // Update stepKey when the URL changes
    this.route.paramMap.pipe(
      map(pm => (pm.get('step') as StepKey) || this.DEFAULT_STEP),
      distinctUntilChanged(),
      takeUntilDestroyed()
    ).subscribe(step => this.stepKey.set(step));

    // Keep selectedId in sync with the current step’s selection
    this.route.paramMap.pipe(
      map(pm => (pm.get('step') as StepKey) || this.DEFAULT_STEP),
      distinctUntilChanged(),
      switchMap(step => this.svc.getSelected$(step)),
      takeUntilDestroyed()
    ).subscribe(id => this.selectedId.set(id));
  }

  select(id: string) {
    this.svc.setSelected(this.stepKey(), id);
  }
}
