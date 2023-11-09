import { Component, OnInit } from '@angular/core';
import { Patient } from './models/patient.model';
import { Study } from './models/study.model';
import { CastorAPIService } from './services/castor-api.service';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import FamilyTree from "src/assets/balkanapp/familytree";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit{
  title = 'FamilyTree';
  study_selected: Study;
  patient_selected: Patient;
  form: Map<string, string>;
  display: Boolean = false;
  patients: Array<Patient> = [];
  langs: any = { 'ne': 'Nederlands', 'en': 'English'};
  currentLang: string = 'ne';
  
  constructor(private service:CastorAPIService, private http: HttpClient,
    public translateService: TranslateService) {
    // Register the supported langauges
    this.translateService.addLangs(Object.keys(this.langs));
    // Mention the default language of your site
    this.translateService.setDefaultLang('ne');
  }
  
  ngOnInit() {
    // Send an authentication request to Castor
    this.service.getAuthentication().subscribe((res: any)=>{
      this.service.setToken(res.access_token);
      // Receive information from premature atherosclerosis study
      this.service.getStudies().subscribe((res_study: any) => {
        res_study._embedded.study.forEach((element_study: Study) => {
          // if (element_study.name=="Premature atherosclerosis"){
          this.study_selected = new Study(element_study);
          this.display=true;
          // }
        });
      });
    })
  }

  patientSelected(patient: Patient){
    // Inform the selected patient to children components
    this.patient_selected = patient;
  }

  formSelected(form: Map<string, string>){
    // Inform the selected form to children components
    this.form = form;
  }

  patientsList(patients: Array<Patient>){
    // Inform the list of survey participants to children components
    this.patients = patients;
  }

  switchLang(e: any) {
    // Inform @ngx-translate about language change
    this.translateService.use(e);
    this.currentLang = e;
  }
}
