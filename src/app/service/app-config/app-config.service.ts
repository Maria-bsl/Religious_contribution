import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { of, switchMap, zip } from 'rxjs';
// import { MessageBoxDialogComponent } from 'src/app/components/dialogs/message-box-dialog/message-box-dialog.component';
// import { FSessionTokens } from 'src/app/models/forms/tokens.model';
// import { UnsubscribeService } from '../unsubscriber/unsubscriber.service';
// import { AppLauncher } from '@capacitor/app-launcher';
// import { Platform } from '@ionic/angular/standalone';
// import { ConfirmMessageBoxComponent } from 'src/app/components/dialogs/confirm-message-box/confirm-message-box.component';
import { Location } from '@angular/common';
import { UnsubscribeService } from '../unsubscriber/unsubscriber.service';
import { MessageBoxComponent } from '../../components/dialogs/message-box/message-box.component';

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  constructor(
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private _dialog: MatDialog,
    private tr: TranslateService,
    private unsubscribe: UnsubscribeService
  ) {}
  /**
   * Registers icons to be available to <mat-icon>
   * @param icons - List of icon names with .svg file extension excluded
   * @param path - Folder path where to find icons specified
   */
  addIcons(icons: string[], path: string) {
    icons.forEach((icon) => {
      this.iconRegistry.addSvgIcon(
        icon,
        this.sanitizer.bypassSecurityTrustResourceUrl(`${path}/${icon}.svg`)
      );
    });
  }
  openAlertDialog(title: string, message: string) {
    return this._dialog.open(MessageBoxComponent, {
      width: '400px',
      data: {
        title: title,
        message: message,
      },
    });
  }
  // private openMessageBoxDialog(title: string, message: string) {
  //   return this._dialog.open(MessageBoxDialogComponent, {
  //     data: {
  //       title: title,
  //       message: message,
  //     },
  //   });
  // }
  // backButtonEventHandler(callback: () => {}) {
  //   this.platform.backButton.subscribeWithPriority(0, () => {
  //     callback();
  //   });
  // }
  // openAlertMessageBox(title: string, message: string) {
  //   let titleObs = this.tr.get(title);
  //   let messageObs = this.tr.get(message);
  //   let merged = zip(titleObs, messageObs);
  //   merged.pipe(this.unsubscribe.takeUntilDestroy).subscribe({
  //     next: (results) => {
  //       let [trTitle, trMessage] = results;
  //       this.openMessageBoxDialog(trTitle, trMessage);
  //     },
  //   });
  // }
  // openConfirmMessageBox(title: string, message: string) {
  //   const confirm = (msg1: string, msg2: string) => {
  //     return this._dialog.open(ConfirmMessageBoxComponent, {
  //       data: {
  //         title: msg1,
  //         message: msg2,
  //       },
  //     });
  //   };
  //   let titleObs = this.tr.get(title);
  //   let messageObs = this.tr.get(message);
  //   let merged = zip(titleObs, messageObs);
  //   return merged.pipe(
  //     this.unsubscribe.takeUntilDestroy,
  //     switchMap((data) => {
  //       let [msg1, msg2] = data;
  //       return of(confirm(msg1, msg2));
  //     })
  //   );
  // }
  // openExternalLink(link: string) {
  //   window.open(link, '_blank', 'noopener,noreferrer');
  // }
  // goBack() {
  //   this.loc.back();
  // }
  // async launchApp(packageName: string) {
  //   const { value } = await AppLauncher.canOpenUrl({
  //     url: packageName,
  //   });
  //   if (value) {
  //     await AppLauncher.openUrl({ url: packageName });
  //   } else {
  //     throw Error(`Failed to launch application ${packageName}.`);
  //   }
  // }
  // get sessionTokens(): FSessionTokens {
  //   return {
  //     token: localStorage.getItem('token'),
  //     expire_time: localStorage.getItem('expire_time'),
  //     expire_timestamp: localStorage.getItem('expire_timestamp'),
  //   };
  // }
  // set sessionTokens(res: any) {
  //   localStorage.setItem('token', res.token);
  //   localStorage.setItem('expire_time', res.expire_time);
  //   localStorage.setItem('expire_timestamp', new Date().toISOString());
  // }
}
