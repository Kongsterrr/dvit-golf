import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaceDeckStepComponent } from './face-deck-step.component';

describe('FaceDeckStepComponent', () => {
  let component: FaceDeckStepComponent;
  let fixture: ComponentFixture<FaceDeckStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaceDeckStepComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FaceDeckStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
