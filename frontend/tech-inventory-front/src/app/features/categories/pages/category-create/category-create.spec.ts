import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { CategoryCreate } from './category-create';

describe('CategoryCreate', () => {
  let component: CategoryCreate;
  let fixture: ComponentFixture<CategoryCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryCreate],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});