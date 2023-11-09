import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Study } from '../models/study.model';
import { Patient } from '../models/patient.model';


@Injectable({
  providedIn: 'root'
})
export class CastorAPIService {
  access_token: string = ''
  private body = new HttpParams()
  .set('client_id', environment.backend.client_id)
  .set('client_secret', environment.backend.client_secret)
  .set('grant_type', 'client_credentials');

  constructor(private httpClient: HttpClient) { }

  public getAuthentication(): any{
    return this.httpClient.post(
      environment.backend.urlCastorAuth+'/oauth/token',
      this.body
    )    
  }

  getToken(){
    return localStorage.getItem('token');
  }

  setToken(token: string){
    localStorage.setItem('token', token);
  }
  
  public getStudies(): Observable<Study>{
    return this.httpClient.get<Study>(environment.backend.urlCastor+'/api/study');
  }

  public getSurveyAnswers(study_id: string, participant_id:string): Observable<any>{
    return this.httpClient.get<any>(environment.backend.urlCastor+'/api/study/'+study_id+'/participant/'+participant_id+'/data-points/survey-instance');
  }

  public getSurveyField(study_id: string, page:string='1'): Observable<any>{
    return this.httpClient.get<any>(environment.backend.urlCastor+'/api/study/'+study_id+'/field?page='+page+'&page_size=1000');
  }

  public getSurveyParticipantAnswerField(study_id: string, patient_id:string, package_id: string, field_id:string): Observable<any>{
    return this.httpClient.get<any>(environment.backend.urlCastor+'/api/study/'+study_id+'/participant/'+patient_id+'/data-point/survey/'+package_id+'/'+field_id);
  }

  public getLinkEditSurvey(study_id: string): Observable<any>{
    return this.httpClient.get<any>(environment.backend.urlCastor+'/api/study/'+study_id+'/survey-package-instance');
  }

  public unlockSurvey(study_id: string, package_id: string): Observable<any> {

    const body = JSON.stringify({locked: false});

    return this.httpClient.patch<any>(environment.backend.urlCastor+'/api/study/'+study_id+'/survey-package-instance/'+package_id, 
            body  
            )

  }

  public lockSurvey(study_id: string, package_id: string): Observable<any> {
    
    const body = JSON.stringify({locked: true});

    return this.httpClient.patch<any>(environment.backend.urlCastor+'/api/study/'+study_id+'/survey-package-instance/'+package_id, 
            body
            )
  }

  public getInitialForm(study_id: string, patient_id: string, page: string = '1'): Observable<any> {
    return this.httpClient.get<any>(environment.backend.urlCastor+'/api/study/'+study_id+'/participant/'+patient_id+'/data-point/study?page='+page)
  }

  public postCustomIcon(study_id: string, patient_id: string, field_id: string, field_value: string): Observable<any> {

    const body= JSON.stringify({
      common: {
        change_reason: "New edition from CastorEDCVascularTree Angular app",
        confirmed_changes: true
      },
      data: [
        {
          field_id: field_id,
          field_value: field_value,
          change_reason: "User from app is editing value",
          confirmed_changes: true
        }
      ]
    })
    return this.httpClient.post<any>(environment.backend.urlCastor+'/api/study/'+study_id+'/participant/'+patient_id+'/data-points/study',
    body)
  }

}
