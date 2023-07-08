import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionSetupComponent } from './section-setup.component';

describe('SectionSetupComponent', () => {
  let component: SectionSetupComponent;
  let fixture: ComponentFixture<SectionSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SectionSetupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectionSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
