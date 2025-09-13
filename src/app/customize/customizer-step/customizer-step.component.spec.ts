import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomizerStepComponent } from './customizer-step.component';

describe('CustomizerStepComponent', () => {
  let component: CustomizerStepComponent;
  let fixture: ComponentFixture<CustomizerStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomizerStepComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CustomizerStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
