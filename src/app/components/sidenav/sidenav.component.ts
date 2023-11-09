import { BooleanInput } from '@angular/cdk/coercion';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Patient } from 'src/app/models/patient.model';
import { Study } from 'src/app/models/study.model';
import { CastorAPIService } from 'src/app/services/castor-api.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit  {
  showFiller: BooleanInput = true;
  @Input() study_selected: Study;
  patient_selected: Patient;
  display: Boolean = false;
  
  @Output() newItemEvent = new EventEmitter<Patient>();
  @Output() newItemEvent2 = new EventEmitter<Study>();
  @Output() newItemEvent3 = new EventEmitter<any>();
  @Output() newItemEvent4 = new EventEmitter<Array<Patient>>();
  
  constructor(private service: CastorAPIService) { }

  ngOnInit(): void {
    this.showFiller = true;
  }

  refresh_token(): void {
    this.service.setToken(this.service.getToken());
  }

  patientSelected(patient: Patient){
    this.patient_selected = patient;
    this.newItemEvent.emit(this.patient_selected);
    this.newItemEvent2.emit(this.study_selected);
  }

  formSelected(form: Map<string, string>){
    this.newItemEvent3.emit(form);
  }

  listPatients(list:Array<Patient>){
    this.newItemEvent4.emit(list);
  }
}

