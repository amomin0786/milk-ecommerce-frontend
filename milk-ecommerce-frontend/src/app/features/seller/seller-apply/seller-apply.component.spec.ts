import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellerApplyComponent } from './seller-apply.component';

describe('SellerApplyComponent', () => {
  let component: SellerApplyComponent;
  let fixture: ComponentFixture<SellerApplyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SellerApplyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SellerApplyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
