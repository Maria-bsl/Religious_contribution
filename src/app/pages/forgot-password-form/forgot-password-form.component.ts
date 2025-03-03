import { Component } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppConfigService } from '../../service/app-config/app-config.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NgxCaptchaModule } from 'ngx-captcha';
import { ApiService } from '../../service/api-service/api.service';
import {
  filterNotNull,
  LoadingService,
} from '../../service/loading-service/loading.service';
import { catchError, filter, finalize, map, of, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-forgot-password-form',
  imports: [
    TranslateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    CommonModule,
    NgxCaptchaModule,
  ],
  templateUrl: './forgot-password-form.component.html',
  styleUrl: './forgot-password-form.component.scss',
})
export class ForgotPasswordFormComponent {
  formGroup!: FormGroup;
  siteKeyGoogleCaptchaKey: string = '6Lcsv9IqAAAAALLyQzvOkf_zHtUuj-n_InZdwbhu';
  secretGoogleCaptchaKey: string = '6Lcsv9IqAAAAAK7fiBdqixI8cSSHAtUudGVyioa7';
  secretQuestions: string = '';
  constructor(
    private _appConfig: AppConfigService,
    private _fb: FormBuilder,
    private _tr: TranslateService,
    private _api: ApiService,
    private _loading: LoadingService
  ) {
    this.registerIcons();
    this.createFormGroup();
  }
  private createFormGroup() {
    this.formGroup = this._fb.group({
      Sno: this._fb.control('', [Validators.required]),
      secretQuestion: this._fb.control('', []),
      answer: this._fb.control('', []),
      recaptcha: this._fb.control('', [Validators.required]),
      recaptchaToken: '',
    });
  }
  private registerIcons() {
    const icons = ['chevron-left'];
    this._appConfig.addIcons(icons, 'bootstrap-icons');
  }
  handleSuccess(text: string) {
    // if (text) {
    //   this.recaptcha && this.recaptcha.setValue(text);
    //   const params = {
    //     secret: this.secretGoogleCaptchaKey,
    //     response: this.recaptcha.value,
    //   };
    //   this._api
    //     .verifyRecaptcha(params)
    //     .pipe(
    //       tap((res) => console.log(res)),
    //       map((res) => res.success)
    //     )
    //     .subscribe(console.log);
    // }
  }
  handleExpire() {
    this.recaptcha.setValue('');
  }
  submitForm(event: Event) {
    const erroneousRes = async (err: any) => {
      this._appConfig.openAlertDialog(
        this._tr.instant('DEFAULTS.FAILED'),
        this._tr.instant('DEFAULTS.ERRORS.UNEXPECTED_ERROR_OCCURRED')
      );
    };
    const success = (res: any) => {
      window.location.href = `${window.location.origin}/Loginnew/Loginnew`;
    };
    const submit = () => {
      this._loading
        .beginLoading()
        .pipe(
          switchMap((loading) =>
            this._api.resetPassword(this.formGroup.value).pipe(
              finalize(() => loading.close()),
              catchError((err) => erroneousRes(err)),
              filterNotNull()
            )
          )
        )
        .subscribe(success);
    };
    if (this.email.invalid) {
      this._appConfig.openAlertDialog(
        this._tr.instant('DEFAULTS.WARNING'),
        this._tr.instant('FORGOT_PASSWORD_PAGE.FORM.ERRORS.EMAIL')
      );
      this.formGroup.markAllAsTouched();
    } else if (this.recaptcha.invalid) {
      this._appConfig.openAlertDialog(
        this._tr.instant('DEFAULTS.WARNING'),
        this._tr.instant('OTP_PAGE.ERRORS.MISSING_CAPTCHA')
      );
      this.formGroup.markAllAsTouched();
    } else {
      submit();
    }
  }
  backToLogin(event: MouseEvent) {
    window.location.href = `${window.location.origin}/Loginnew/Loginnew`;
  }
  get email() {
    return this.formGroup.get('Sno') as FormControl;
  }
  get secretQuestion() {
    return this.formGroup.get('secretQuestion') as FormControl;
  }
  get answer() {
    return this.formGroup.get('answer') as FormControl;
  }
  set recaptcha(recaptcha: any) {}
  get recaptcha() {
    return this.formGroup.get('recaptcha') as FormControl;
  }
  set recaptchaToken(token: any) {}
  get recaptchaToken() {
    return this.formGroup.get('recaptchaToken');
  }
  get secretQuestions$() {
    try {
      const regex = /^([^,]+,)*[^,]+$/;
      if (!regex.test(this.secretQuestions)) {
        throw new Error('Secret questions must be comma separated');
      }
      return of(this.secretQuestions).pipe(map((value) => value.split(',')));
    } catch (err: any) {
      console.error(err.message);
      return of([]);
    }
  }
}
