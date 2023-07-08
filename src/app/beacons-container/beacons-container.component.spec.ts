import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeaconsContainerComponent } from './beacons-container.component';

describe('BeaconsContainerComponent', () => {
  let component: BeaconsContainerComponent;
  let fixture: ComponentFixture<BeaconsContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BeaconsContainerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BeaconsContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
