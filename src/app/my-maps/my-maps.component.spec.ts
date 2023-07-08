import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyMapsComponent } from './my-maps.component';

describe('MyMapsComponent', () => {
  let component: MyMapsComponent;
  let fixture: ComponentFixture<MyMapsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyMapsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyMapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
