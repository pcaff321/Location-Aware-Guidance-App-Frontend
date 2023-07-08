import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyNetworkDevicesComponent } from './my-network-devices.component';

describe('MyNetworkDevicesComponent', () => {
  let component: MyNetworkDevicesComponent;
  let fixture: ComponentFixture<MyNetworkDevicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyNetworkDevicesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyNetworkDevicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
