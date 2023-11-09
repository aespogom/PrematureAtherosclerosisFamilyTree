// Translate Class to extend
import { TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
export class customTranslate implements TranslateLoader {
  constructor(private http: HttpClient) { }
  getTranslation(lang: string): Observable<any> {
    // Here we are making http call to our server to get the 
    // translation files. lang will be our language for which we are 
    // calling translations if it fails to get that language's 
    // translation then translation should be called for en language.
   return this.http.get(`./assets/lang/${lang}.json`)
    .pipe(catchError((_) =>
     this.http.get(`./assets/lang/en.json`)));
 }
}