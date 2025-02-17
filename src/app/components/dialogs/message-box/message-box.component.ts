import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

export type MessageDialogTitles = {
  title: string;
  message: string;
};

@Component({
  selector: 'app-message-box',
  standalone: true,
  imports: [MatDialogModule, TranslateModule, MatButtonModule],
  templateUrl: './message-box.component.html',
  styleUrl: './message-box.component.scss',
})
export class MessageBoxComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: MessageDialogTitles) {}
}
