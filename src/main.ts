import {
  bootstrapApplication,
  createApplication,
} from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import {
  importProvidersFrom,
  inject,
  provideExperimentalZonelessChangeDetection,
} from '@angular/core';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { LoginComponent } from './app/pages/login/login.component';
import { createCustomElement, NgElementConstructor } from '@angular/elements';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { MatDialogModule } from '@angular/material/dialog';
import { RecaptchaComponent } from './app/pages/recaptcha/recaptcha.component';
import { ForgotPasswordFormComponent } from './app/pages/forgot-password-form/forgot-password-form.component';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, 'i18n/', '.json');
}

function defineCustomElement(name: string, customComponent: any) {
  if (!customElements.get(name)) {
    customElements.define(name, customComponent);
  }
}

(async () => {
  const app = await createApplication({
    providers: [
      {
        provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
        useValue: { appearance: 'outline' },
      },
      provideExperimentalZonelessChangeDetection(),
      provideHttpClient(),
      importProvidersFrom([
        MatDialogModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: createTranslateLoader,
            deps: [HttpClient],
          },
          isolate: false,
          extend: true,
          defaultLanguage: 'en', //
          useDefaultLang: true,
        }),
      ]),
      provideAnimationsAsync(),
      provideHttpClient(),
    ],
  });

  (() => {
    defineCustomElement(
      'login-form',
      createCustomElement(LoginComponent, {
        injector: app.injector,
      })
    );
    defineCustomElement(
      'recaptcha-form',
      createCustomElement(RecaptchaComponent, {
        injector: app.injector,
      })
    );
    defineCustomElement(
      'forgot-password-form',
      createCustomElement(ForgotPasswordFormComponent, {
        injector: app.injector,
      })
    );
  })();
})();

// bootstrapApplication(AppComponent, appConfig)
//   .catch((err) => console.error(err));
