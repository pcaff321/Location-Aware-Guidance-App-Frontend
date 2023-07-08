import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerProjectsViewComponent } from './container-projects-view.component';

describe('ContainerProjectsViewComponent', () => {
  let component: ContainerProjectsViewComponent;
  let fixture: ComponentFixture<ContainerProjectsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContainerProjectsViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContainerProjectsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
