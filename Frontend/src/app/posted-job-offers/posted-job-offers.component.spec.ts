import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostedJobOffersComponent } from './posted-job-offers.component';

describe('PostedJobOffersComponent', () => {
  let component: PostedJobOffersComponent;
  let fixture: ComponentFixture<PostedJobOffersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostedJobOffersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PostedJobOffersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
