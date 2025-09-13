import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CustomizerService } from '../customizer.service';

@Component({
  standalone: true,
  selector: 'app-face-deck-step',
  imports: [CommonModule, RouterModule],
  templateUrl: './face-deck-step.component.html',
  styleUrls: ['./face-deck-step.component.scss'],
})
export class FaceDeckStepComponent {
  // private svc = inject(CustomizerService);

  // options = this.svc.faceDeckOptions;

  // // 👇 bridge BehaviorSubject -> Signal (with a solid initial value)
  // selectedId = toSignal(this.svc.faceDeck$, { initialValue: this.svc.faceDeck });

  // // 👇 now this recomputes whenever selectedId() changes
  // selected = computed(() => this.options.find(o => o.id === this.selectedId())!);

  // select(id: any) { this.svc.setFaceDeck(id); }
}
