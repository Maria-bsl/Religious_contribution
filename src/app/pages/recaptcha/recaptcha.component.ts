import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgxCaptchaModule } from 'ngx-captcha';

@Component({
  selector: 'app-recaptcha',
  imports: [NgxCaptchaModule, CommonModule, ReactiveFormsModule],
  templateUrl: './recaptcha.component.html',
  styleUrl: './recaptcha.component.scss',
  standalone: true,
})
export class RecaptchaComponent {
  formGroup!: FormGroup;
  siteKeyGoogleCaptchaKey: string = '6Lcsv9IqAAAAALLyQzvOkf_zHtUuj-n_InZdwbhu';
  secretGoogleCaptchaKey: string = '6Lcsv9IqAAAAAK7fiBdqixI8cSSHAtUudGVyioa7';
  @Output('recaptcha') m_recaptcha: string = this.recaptcha.value;
  constructor(private _fb: FormBuilder) {
    this.createFormGroup();
  }
  private createFormGroup() {
    this.formGroup = this._fb.group({
      recaptcha: this._fb.control('', [Validators.required]),
    });
  }
  handleExpire() {
    this.recaptcha.setValue('');
  }
  handleSuccess(text: string) {
    this.recaptcha && this.recaptcha.setValue(text);
    this.m_recaptcha = this.recaptcha.value;
  }
  get recaptcha() {
    return this.formGroup.get('recaptcha') as FormControl;
  }
}
