import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageClickerComponent } from './image-clicker.component';

describe('ImageClickerComponent', () => {
  let component: ImageClickerComponent;
  let fixture: ComponentFixture<ImageClickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImageClickerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageClickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
