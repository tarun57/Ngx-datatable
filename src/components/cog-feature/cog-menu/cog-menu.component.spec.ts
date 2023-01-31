import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CogMenuComponent } from './cog-menu.component';

describe('CogMenuComponent', () => {
  let component: CogMenuComponent;
  let fixture: ComponentFixture<CogMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CogMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CogMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
