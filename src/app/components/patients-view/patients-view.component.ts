import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Answer } from 'src/app/models/answer.model';
import { Patient } from 'src/app/models/patient.model';
import { Study } from 'src/app/models/study.model';
import { CastorAPIService } from 'src/app/services/castor-api.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import { NAME_SURVEY_FIELD_ID, YEAR_SURVEY_FIELD_ID } from '../../utilities/constants';

@Component({
  selector: 'app-patients-view',
  templateUrl: './patients-view.component.html',
  styleUrls: ['./patients-view.component.scss']
})
export class PatientsViewComponent implements OnInit {
  @Input() study: Study;
  patients: Array<Patient> = [];
  search_list: Array<Patient>;
  searchTerm: string = "";
  patient_selected: Patient;
  display: Boolean = false;
  form: Map<string, string> = new Map();
  @Output() newItemEvent = new EventEmitter<Patient>();
  @Output() newItemEvent2 = new EventEmitter<Map<string, string>>();
  @Output() newItemEvent3 = new EventEmitter<Array<Patient>>();


  constructor(private service:CastorAPIService, private spinner: SpinnerService) { }
  
  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['study']) {
      this.showPatients();
    }
  }

  showPatients(): void {
    // Common information for all participants in a given survey
    this.spinner.setLoading(true)
    // Store survey questions
    let pages: number;
    this.service.getSurveyField(this.study.study_id).subscribe((questions: any) => {
      pages = questions.page_count
      questions._embedded.fields.map((q: any) => {
        this.form.set(q.field_id, q.field_variable_name)
      })
      for (let page=2; page < pages+1; page++){
        this.service.getSurveyField(this.study.study_id, page.toString()).subscribe((questions: any) => {
          questions._embedded.fields.map((q: any) => {
            this.form.set(q.field_id, q.field_variable_name)
          })
          if (page==pages-1){
            this.newItemEvent2.emit(this.form);
            this.spinner.setLoading(false);
          } 
        })
      }
    })

    // Get link for editing feature
    this.service.getLinkEditSurvey(this.study.study_id).subscribe((answer: any)=> {
      answer._embedded.surveypackageinstance.map((inst: any)=> {
        if (inst.progress && inst.progress>0) {
          let patient_instance = new Patient(inst);
          this.service.getSurveyParticipantAnswerField(this.study.study_id, patient_instance.patient_id, inst.survey_package_instance_id, NAME_SURVEY_FIELD_ID).subscribe((name_answer: any)=>{
            patient_instance.name = name_answer.value;
            this.service.getSurveyParticipantAnswerField(this.study.study_id, patient_instance.patient_id, inst.survey_package_instance_id, YEAR_SURVEY_FIELD_ID).subscribe((age_answer: any)=>{
              patient_instance.name = patient_instance.name+' '+age_answer.value;
              this.patients.push(patient_instance);
            });
          });
        }
      });
      // Send participant list
      this.search_list = this.patients;
      this.newItemEvent3.emit(this.patients);
    })
  }

  onPress(patient: Patient){  
    // Action when a participant is selected
    this.patient_selected = patient;
    this.fillPatient(patient);
    
  }

  fillPatient(patient: Patient) {
    // Fill in the patient information from the survey
    this.service.getSurveyAnswers(this.study.study_id, patient.patient_id).subscribe((el_answer: any) => {
      this.spinner.setLoading(true)
      el_answer._embedded.items.map((answer: Answer) => {
        let form_field = this.form.get(answer.field_id)
        if(
          form_field && // exclude undefined or children
          !form_field.includes('SoMM')&& !form_field.includes('BoMM') && // exclude great aunts
          !form_field.includes('SoFM')&& !form_field.includes('BoFM') &&
          !form_field.includes('SoMF')&& !form_field.includes('BoMF') &&
          !form_field.includes('SoFF')&& !form_field.includes('BoFF') 
        ){
          patient.options.set(form_field, answer.field_value);
        }
      })
      // Fill in laboratory and demographic information
      this.service.getInitialForm(this.study.study_id, patient.patient_id).subscribe((form_answer:any) => {
        let pages = form_answer.page_count
        form_answer._embedded['StudyDataPoints'].map((answer: any) => {
          if (answer.field_variable_name=='add_feat_spec'){
            let multiple_answer = {}
            answer.value!='' ? multiple_answer=JSON.parse(answer.value) : answer;
            for (let field in multiple_answer){
              patient.options.set(field, multiple_answer[field]);
            }
          } 
          patient.options.set(answer.field_variable_name, answer.value);
        })
        if (pages>1){
          for (let page=2; page < pages+1; page++){
            this.service.getInitialForm(this.study.study_id, patient.patient_id, page.toString()).subscribe((form_answer: any) => {
              form_answer._embedded['StudyDataPoints'].map((answer: any) => {
                if (answer.field_variable_name=='add_feat_spec'){
                  let multiple_answer = {}
                  answer.value!='' ? multiple_answer=JSON.parse(answer.value) : answer;
                  for (let field in multiple_answer){
                    patient.options.set(field, multiple_answer[field]);
                  }
                } 
                patient.options.set(answer.field_variable_name, answer.value);
              })
              if (page==pages){
                patient.options.delete(null)
                patient.options.delete(undefined) // TODO POR QUE EXISTEN UNDEFINED hay varios campos "" y null --> hablar con alan ID: 
                this.patient_selected = patient;
                this.display = true;
                console.log(this.patient_selected.options)
                this.newItemEvent.emit(this.patient_selected);
                this.spinner.setLoading(false)
              } 
            })
          }
        } else {
          patient.options.delete(null)
          patient.options.delete(undefined) // TODO POR QUE EXISTEN UNDEFINED hay varios campos "" y null --> hablar con alan ID: 
          this.patient_selected = patient;
          this.display = true;
          console.log(this.patient_selected.options)
          this.newItemEvent.emit(this.patient_selected);
          this.spinner.setLoading(false)
        }
        
      })
    })
  }

  filterPatients(searchTerm: string) {
    // Filter the patients to be displayed based on the term from the search bar
    this.search_list = this.patients.filter((p:Patient)=> {
      return p.name.toLowerCase().includes(searchTerm.toLowerCase())}
    )
    if (searchTerm==""){
      this.search_list = this.patients;
    }
  }

}
