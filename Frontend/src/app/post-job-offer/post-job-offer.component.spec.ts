import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostJobOfferComponent } from './post-job-offer.component';

describe('PostJobOfferComponent', () => {
  let component: PostJobOfferComponent;
  let fixture: ComponentFixture<PostJobOfferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostJobOfferComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PostJobOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
