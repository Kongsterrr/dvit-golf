import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StepKey, STEPS } from './steps.config';

@Injectable({ providedIn: 'root' })
export class CustomizerService {
  // one BehaviorSubject per step
  private selectedByStep: Record<StepKey, BehaviorSubject<string>> = {
    face:      new BehaviorSubject<string>(STEPS.face.options[0].id),
    weighting: new BehaviorSubject<string>(STEPS.weighting.options[0].id),
    // connector: new BehaviorSubject<string>('...'),
  };

  getSelected$(step: StepKey): Observable<string> {
    return this.selectedByStep[step].asObservable();
  }
  getSelected(step: StepKey): string {
    return this.selectedByStep[step].value;
  }
  setSelected(step: StepKey, id: string): void {
    this.selectedByStep[step].next(id);
  }
}
