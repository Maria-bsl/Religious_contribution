import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  TranslateModule,
  TranslatePipe,
  TranslateService,
} from '@ngx-translate/core';
import { AppConfigService } from '../../service/app-config/app-config.service';
import { MatIconModule } from '@angular/material/icon';
import { catchError, finalize, mergeMap, Observable, of } from 'rxjs';
import {
  DomManipulationService,
  filterNotNull,
  MElementPair,
  THtmlElementControls,
} from '../../service/dom-manipulation/dom-manipulation.service';
import { UnsubscribeService } from '../../service/unsubscriber/unsubscriber.service';
import anime from 'animejs/lib/anime.es.js';
import { NgxCaptchaModule } from 'ngx-captcha';
import { ApiService } from '../../service/api-service/api.service';
import { CommonModule } from '@angular/common';
import { toast, NgxSonnerToaster } from 'ngx-sonner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MessageBoxComponent } from '../../components/dialogs/message-box/message-box.component';
import { inOutAnimation } from '../../shared/fade-in-out-animation';
import { LoadingService } from '../../service/loading-service/loading.service';

export enum ELoginForm {
  USERNAME_TEXTFIELD,
  PASSWORD_TEXTFIELD,
  FORGOT_PASSWORD_BUTTON,
  LOGIN_BUTTON,
}

export interface LoginForm {
  txtu: string;
  txtpwd: string;
}

@Component({
  selector: 'app-login',
  imports: [
    MatButtonModule,
    MatSidenavModule,
    MatGridListModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    RouterLink,
    ReactiveFormsModule,
    TranslateModule,
    NgxCaptchaModule,
    CommonModule,
    NgxSonnerToaster,
    MatDialogModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  standalone: true,
  animations: [inOutAnimation],
  providers: [TranslatePipe],
})
export class LoginComponent implements AfterViewInit {
  @Input() keys: string = '';
  @Output('login') login: EventEmitter<string> = new EventEmitter<string>();
  hasPasswordError$: Observable<boolean> = of(false);
  ids$!: Observable<MElementPair>;
  formGroup!: FormGroup;
  siteKeyGoogleCaptchaKey: string = '6Lcsv9IqAAAAALLyQzvOkf_zHtUuj-n_InZdwbhu';
  secretGoogleCaptchaKey: string = '6Lcsv9IqAAAAAK7fiBdqixI8cSSHAtUudGVyioa7';
  constructor(
    private _appConfig: AppConfigService,
    private _fb: FormBuilder,
    private _dom: DomManipulationService,
    private _unsubscribe: UnsubscribeService,
    private _api: ApiService,
    private _dialog: MatDialog,
    private _tr: TranslateService,
    private _loading: LoadingService
  ) {
    this.registerIcons();
    this.createFormGroup();
  }
  private createFormGroup() {
    this.formGroup = this._fb.group({
      username: this._fb.control('', [Validators.required]),
      password: this._fb.control('', [Validators.required]),
      recaptcha: this._fb.control('', []),
    });
  }
  private registerIcons() {
    const icons = ['lock-fill', 'person-fill'];
    this._appConfig.addIcons(icons, 'bootstrap-icons');
  }
  private initIds() {
    this.ids$ = this._dom.createIds(this.keys, ELoginForm);
    const controls: THtmlElementControls[] = [
      [this.username$, this.username],
      [this.password$, this.password],
    ];
    const events = this._dom.registerFormControls(controls);
    events.pipe(this._unsubscribe.takeUntilDestroy).subscribe({
      error: (e) => console.error(e),
    });
  }
  private animateText() {
    anime
      .timeline()
      .add({
        targets: '#slogan',
        easing: 'easeInOutQuad',
        duration: 500,
        translateY: '100%',
      })
      .add({
        targets: '#quote-author',
        easing: 'easeInOutQuad',
        duration: 500,
        translateY: '100%',
      });
  }
  ngAfterViewInit(): void {
    this.animateText();
    //this.initIds();
  }
  forgotPasswordClicked(event: MouseEvent) {
    window.location.href = `${window.location.origin}/Forgot/Forgot`;
  }
  handleExpire() {
    this.recaptcha.setValue('');
  }
  submitForm(event: Event) {
    type LoginRes = { check: string };
    const openAlertDialog = (title: string, message: string) => {
      const dialogRef = this._dialog.open(MessageBoxComponent, {
        width: '400px',
        data: {
          title: title,
          message: message,
        },
      });
    };
    const erroneousRes = async (err: any) => {
      openAlertDialog(
        this._tr.instant('DEFAULTS.FAILED'),
        this._tr.instant('DEFAULTS.ERRORS.UNEXPECTED_ERROR_OCCURRED')
      );
    };

    const switchSuccessErrorRes = (res: LoginRes) => {
      switch (res.check) {
        case 'The input date is greater than 24 hours ago':
          openAlertDialog(
            this._tr.instant('LOGIN_FORM.FORM.ERRORS.LOGIN_FAILED'),
            this._tr.instant('LOGIN_FORM.FORM.ERRORS.INVALID_INPUT_DATE')
          );
          break;
        case 'Username or password is incorrect':
          openAlertDialog(
            this._tr.instant('LOGIN_FORM.FORM.ERRORS.LOGIN_FAILED'),
            this._tr.instant(
              'LOGIN_FORM.FORM.ERRORS.INVALID_USERNAME_OR_PASSWORD'
            )
          );
          break;
        case 'You are already logged in (or)  the browser is closed without logout, please try again after sometime':
          openAlertDialog(
            this._tr.instant('LOGIN_FORM.FORM.ERRORS.LOGIN_FAILED'),
            this._tr.instant('LOGIN_FORM.FORM.ERRORS.ALREADY_LOGGED_IN')
          );
          break;
        case 'Your account has been blocked, Please contact the Administrator.':
          openAlertDialog(
            this._tr.instant('LOGIN_FORM.FORM.ERRORS.LOGIN_FAILED'),
            this._tr.instant('LOGIN_FORM.FORM.ERRORS.ACCOUNT_BLOCKED')
          );
          break;
        default:
          openAlertDialog(
            this._tr.instant('LOGIN_FORM.FORM.ERRORS.LOGIN_FAILED'),
            this._tr.instant(res.check)
          );
      }
      this.hasPasswordError$ = of(true);
      this.recaptcha.addValidators(Validators.required);
    };
    const success = (res: LoginRes) => {
      if (!res) return;
      switch (res.check) {
        case 'uname ,pwd':
        case 'OTP':
          window.location.href = `${window.location.origin}/OtpCode/OtpCode`;
          break;
        case 'Emp':
          window.location.href = `${window.location.origin}/AdminD/AdminD`;
          break;
        default:
          switchSuccessErrorRes(res);
          break;
      }
    };
    const submit = () => {
      const params = {
        uname: this.username.value,
        pwd: this.password.value,
      };
      this._loading
        .beginLoading()
        .pipe(
          mergeMap((loading) =>
            this._api.addLogin(params).pipe(
              finalize(() => loading.close()),
              catchError((err) => erroneousRes(err)),
              filterNotNull()
            )
          )
        )
        .subscribe(success);
    };
    this.formGroup.markAllAsTouched();
    this.formGroup.valid && submit();
  }
  handleSuccess(text: string) {
    this.recaptcha && this.recaptcha.setValue(text);
  }
  get username$() {
    return this._dom.getDomElement$<HTMLInputElement>(
      this.ids$,
      ELoginForm.USERNAME_TEXTFIELD
    );
  }
  get password$() {
    return this._dom.getDomElement$<HTMLInputElement>(
      this.ids$,
      ELoginForm.PASSWORD_TEXTFIELD
    );
  }
  get forgotPassword$() {
    return this._dom.getDomElement$<HTMLAnchorElement>(
      this.ids$,
      ELoginForm.FORGOT_PASSWORD_BUTTON
    );
  }
  get loginButton$() {
    return this._dom.getDomElement$<HTMLInputElement>(
      this.ids$,
      ELoginForm.LOGIN_BUTTON
    );
  }
  get username() {
    return this.formGroup.get('username') as FormControl;
  }
  get password() {
    return this.formGroup.get('password') as FormControl;
  }
  get recaptcha() {
    return this.formGroup?.get('recaptcha') as FormControl;
  }
}
