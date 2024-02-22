import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobIndexComponent } from './job-index.component';

describe('JobIndexComponent', () => {
  let component: JobIndexComponent;
  let fixture: ComponentFixture<JobIndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobIndexComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(JobIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
