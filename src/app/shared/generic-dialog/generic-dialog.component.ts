import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogOptions } from '@models/dialog-options';

@Component({
  selector: 'app-generic-dialog',
  templateUrl: './generic-dialog.component.html',
  styleUrls: ['./generic-dialog.component.scss'],
})
export class GenericDialogComponent {
  dialogOptions: DialogOptions;

  constructor(
    private dialogRef: MatDialogRef<GenericDialogComponent>,
    @Inject(MAT_DIALOG_DATA) options: DialogOptions
  ) {
    this.dialogOptions = options;
  }

  onFalseClick(): void {
    this.dialogRef.close(false);
  }

  onTrueClick(): void {
    this.dialogRef.close(true);
  }
}
