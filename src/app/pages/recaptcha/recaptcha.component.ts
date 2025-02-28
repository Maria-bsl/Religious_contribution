import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgxCaptchaModule } from 'ngx-captcha';
import { NgOtpInputModule } from 'ng-otp-input';
import { MatButtonModule } from '@angular/material/button';
import {
  catchError,
  delay,
  finalize,
  interval,
  map,
  mergeMap,
  Observable,
  startWith,
  switchMap,
  takeWhile,
  tap,
  timer,
} from 'rxjs';
import { UnsubscribeService } from '../../service/unsubscriber/unsubscriber.service';
import { inOutAnimation } from '../../shared/fade-in-out-animation';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { MessageBoxComponent } from '../../components/dialogs/message-box/message-box.component';
import { LoadingService } from '../../service/loading-service/loading.service';
import { ApiService } from '../../service/api-service/api.service';

type DataRes = {
  check: string;
  flogin: boolean | string;
  InstID: string | number;
  Usno: string | number;
};

@Component({
  selector: 'app-recaptcha',
  imports: [
    NgxCaptchaModule,
    CommonModule,
    ReactiveFormsModule,
    NgOtpInputModule,
    MatButtonModule,
    TranslateModule,
  ],
  templateUrl: './recaptcha.component.html',
  styleUrl: './recaptcha.component.scss',
  standalone: true,
  animations: [inOutAnimation],
})
export class RecaptchaComponent {
  formGroup!: FormGroup;
  siteKeyGoogleCaptchaKey: string = '6Lcsv9IqAAAAALLyQzvOkf_zHtUuj-n_InZdwbhu';
  secretGoogleCaptchaKey: string = '6Lcsv9IqAAAAAK7fiBdqixI8cSSHAtUudGVyioa7';
  @Output('recaptcha') m_recaptcha: string = '';
  @Input('resend-code-timeout') resendCodeTimeout: string = '300';
  static OTP_MAX_LENGTH: number = 6;
  timer$!: Observable<number>;
  otpConfig = {
    allowNumbersOnly: true,
    length: RecaptchaComponent.OTP_MAX_LENGTH,
    isPasswordInput: false,
    disableAutoFocus: false,
    placeholder: '',
    inputStyles: {
      width: '45px',
      height: '45px',
    },
  };
  constructor(
    private _fb: FormBuilder,
    private unsubsribe: UnsubscribeService,
    private tr: TranslateService,
    private _dialog: MatDialog,
    private _loading: LoadingService,
    private _api: ApiService
  ) {
    //this.startTimer();
    this.createFormGroup();
  }
  private createFormGroup() {
    this.formGroup = this._fb.group({
      recaptcha: this._fb.control('', [Validators.required]),
      opt_code: this._fb.control<string>('', [
        Validators.required,
        Validators.minLength(RecaptchaComponent.OTP_MAX_LENGTH),
      ]),
      recaptchaToken: '',
    });
  }
  private openAlertDialog(title: string, message: string) {
    return this._dialog.open(MessageBoxComponent, {
      width: '400px',
      data: {
        title: title,
        message: message,
      },
    });
  }
  startTimer() {
    this.timer$ = interval(1000).pipe(
      map((elapsed) => Number(this.resendCodeTimeout) - elapsed),
      takeWhile((remaining) => remaining >= 0),
      startWith(Number(this.resendCodeTimeout))
    );
  }
  handleExpire() {
    this.recaptcha.setValue('');
  }
  handleSuccess(text: string) {
    if (text) {
      // this.recaptcha && this.recaptcha.setValue(text);
      // this.m_recaptcha = this.recaptcha.value;
      // this.recaptcha && this.recaptcha.setValue(text);
      // const params = {
      //   secret: this.secretGoogleCaptchaKey,
      //   response: text,
      // };
      // this._api
      //   .verifyRecaptcha(params)
      //   .pipe(
      //     tap((res) => console.log(res)),
      //     map((res) => res.success)
      //   )
      //   .subscribe(console.log);
    }
  }
  submitForm(event: Event) {
    const erroneousRes = async (err: any) => {
      this.openAlertDialog(
        this.tr.instant('DEFAULTS.FAILED'),
        this.tr.instant('OTP_PAGE.ERRORS.FAILED_TO_VERIFY_CODE')
      );
    };
    const success = (data: DataRes) => {
      if (!data) return;
      else if (data.flogin == 'false') {
        window.location.href = `${window.location.origin}/Updatepwd/Updatepwd?type=${data.check}&Instid=${data.InstID}&Usersno=${data.Usno}`;
      } else {
        switch (data.check) {
          case 'User':
            window.location.href = `${window.location.origin}/InsD/InsD`;
            break;
          case 'Member':
            window.location.href = `${window.location.origin}/MemberD/MemberD`;
            break;
          case 'Emp':
            window.location.href = `${window.location.origin}/AdminD/AdminD`;
            break;
          case 'Dio_Users':
            window.location.href = `${window.location.origin}/Diocese_D/Diocese_D`;
            break;
          case 'Par_Users':
            window.location.href = `${window.location.origin}/Setup_Par/Setup_Par`;
            break;
          default:
            this.openAlertDialog(
              this.tr.instant('OTP_PAGE.ERRORS.VERIFICATION_FAILED'),
              data.check
            );
            break;
        }
      }
    };
    if (this.opt_code.invalid) {
      this.openAlertDialog(
        this.tr.instant('OTP_PAGE.LABELS.INVALID_FORM'),
        this.tr.instant('OTP_PAGE.ERRORS.INVALID_VERIFICATION_CODE')
      );
    } else if (this.recaptcha.invalid) {
      this.openAlertDialog(
        this.tr.instant('OTP_PAGE.LABELS.INVALID_FORM'),
        this.tr.instant('OTP_PAGE.ERRORS.MISSING_CAPTCHA')
      );
    } else {
      this._loading
        .beginLoading()
        .pipe(
          mergeMap((loading) =>
            this._api.otpCode({ otp: this.opt_code.value }).pipe(
              this.unsubsribe.takeUntilDestroy,
              finalize(() => loading.close()),
              catchError((err) => erroneousRes(err))
            )
          )
        )
        .subscribe(success);
    }
  }
  resendOtpCode(event: MouseEvent) {
    const erroneousRes = async (err: any) => {
      this.openAlertDialog(
        this.tr.instant('DEFAULTS.FAILED'),
        this.tr.instant('OTP_PAGE.ERRORS.FAILED_TO_VERIFY_CODE')
      );
    };
    const success = (data: DataRes) => {
      if (!data) return;
      else if (data.flogin == 'false') {
        window.location.href = `${window.location.origin}/Updatepwd/Updatepwd?type=${data.check}&Instid=${data.InstID}&Usersno=${data.Usno}`;
      } else {
        switch (data.check) {
          case 'OTP':
            window.location.href = `${window.location.origin}/OtpCode/OtpCode`;
            break;
          case 'User':
            window.location.href = `${window.location.origin}/InsD/InsD`;
            break;
          case 'Member':
            window.location.href = `${window.location.origin}/MemberD/MemberD`;
            break;
          case 'Emp':
            window.location.href = `${window.location.origin}/AdminD/AdminD`;
            break;
          case 'Dio_Users':
            window.location.href = `${window.location.origin}/Diocese_D/Diocese_D`;
            break;
          case 'Par_Users':
            window.location.href = `${window.location.origin}/Setup_Par/Setup_Par`;
            break;
          default:
            this.openAlertDialog(
              this.tr.instant('OTP_PAGE.ERRORS.VERIFICATION_FAILED'),
              data.check
            );
            break;
        }
      }
    };
    this._loading
      .beginLoading()
      .pipe(
        mergeMap((loading) =>
          this._api.resendOtpCode({ otp: this.opt_code.value }).pipe(
            this.unsubsribe.takeUntilDestroy,
            finalize(() => loading.close()),
            catchError((err) => erroneousRes(err))
          )
        )
      )
      .subscribe(success);
  }
  backHome(event: MouseEvent) {
    window.location.href = `${window.location.origin}/Loginnew/Loginnew`;
  }
  recaptchaError(error: any) {
    console.log('The error');
  }
  get recaptcha() {
    return this.formGroup.get('recaptcha') as FormControl;
  }
  set recaptcha(captcha: any) {
    //return this.formGroup.get('recaptcha') as FormControl;
  }
  get opt_code() {
    return this.formGroup.get('opt_code') as FormControl;
  }
  set recaptchaToken(captcha: any) {
    //return this.formGroup.get('opt_code') as FormControl;
  }
  get recaptchaToken() {
    return this.formGroup.get('recaptchaToken');
  }
}
