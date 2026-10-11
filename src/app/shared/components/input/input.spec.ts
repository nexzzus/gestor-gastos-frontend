import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from './input';

@Component({
  imports: [ReactiveFormsModule, InputComponent],
  template: `
    <form [formGroup]="form">
      <app-input
        id="title"
        formControlName="title"
        label="Título"
        placeholder="Título del movimiento"
      />
    </form>
  `,
})
class TestHostComponent {
  form = new FormGroup({
    title: new FormControl('Initial Title'),
  });
}

describe('InputComponent with ReactiveForms', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let nativeInput: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    nativeInput = fixture.nativeElement.querySelector('input');
  });

  it('should initialize with form control value', () => {
    expect(nativeInput.value).toBe('Initial Title');
  });

  it('should reset native input and control value when form is reset', async () => {
    host.form.reset({ title: '' });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(host.form.get('title')?.value).toBe('');
    expect(nativeInput.value).toBe('');
  });

  it('should clear native input even when reset is called with null', async () => {
    host.form.reset();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(host.form.get('title')?.value).toBeNull();
    expect(nativeInput.value).toBe('');
  });

  it('should update form control when typing into native input', async () => {
    nativeInput.value = 'Nuevo Gasto';
    nativeInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(host.form.get('title')?.value).toBe('Nuevo Gasto');
  });
});
