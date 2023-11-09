import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Patient } from 'src/app/models/patient.model';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {

  patient_list: Array<Patient>;
  patient_list_filtered: Array<Patient>;
  related_participant: Patient;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<DialogComponent>) { }

  ngOnInit():void {
    this.patient_list = this.data.data
    this.patient_list_filtered = this.patient_list.filter(p => p.patient_id != this.data.id )
  }

  onPress(){
    this.dialogRef.close(this.related_participant);
  }

}


