import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateNetworkDeviceComponent } from './create-network-device.component';

describe('CreateNetworkDeviceComponent', () => {
  let component: CreateNetworkDeviceComponent;
  let fixture: ComponentFixture<CreateNetworkDeviceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateNetworkDeviceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateNetworkDeviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
