import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSitePageComponent } from './create-site-page.component';

describe('CreateSitePageComponent', () => {
  let component: CreateSitePageComponent;
  let fixture: ComponentFixture<CreateSitePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateSitePageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateSitePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
