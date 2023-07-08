import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeaconSetupComponent } from './beacon-setup.component';

describe('BeaconSetupComponent', () => {
  let component: BeaconSetupComponent;
  let fixture: ComponentFixture<BeaconSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BeaconSetupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BeaconSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
