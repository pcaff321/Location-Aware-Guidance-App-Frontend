import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverviewSetupComponent } from './overview-setup.component';

describe('OverviewSetupComponent', () => {
  let component: OverviewSetupComponent;
  let fixture: ComponentFixture<OverviewSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OverviewSetupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OverviewSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
