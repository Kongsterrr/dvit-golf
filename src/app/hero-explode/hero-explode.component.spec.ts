import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroExplodeComponent } from './hero-explode.component';

describe('HeroExplodeComponent', () => {
  let component: HeroExplodeComponent;
  let fixture: ComponentFixture<HeroExplodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroExplodeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HeroExplodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
