import { Component, Inject, OnInit, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-confirm',
  templateUrl: './dialog-confirm.component.html',
  styleUrls: ['./dialog-confirm.component.scss'],
})
export class DialogConfirmComponent implements OnInit, AfterViewInit {
  cancel() {
    this.dialogRef.close(false);
  }
  confirm() {
    this.dialogRef.close(true);
  }

  message: string = 'Are you sure?';
  color: string = 'red';
  icon: string = 'warning';
  title: string = '!!!';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DialogConfirmComponent>
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.message = this.data.message || 'Are you sure?';
    this.color = this.data.color || 'red';
    this.icon = this.data.icon || 'warning';
    this.title = this.data.title || '!!!';
  }
}
