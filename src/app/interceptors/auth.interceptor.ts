import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpHeaders
} from '@angular/common/http';
import {  Observable, throwError  } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import { CastorAPIService } from '../services/castor-api.service';
import { SpinnerService } from '../services/spinner.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private service:CastorAPIService, private spinner: SpinnerService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!req.url.includes('oauth')){
      let clonedReq = this.addHeaders(req)
      return next.handle(clonedReq).pipe(
        retry(1),
        catchError((err: HttpErrorResponse) => {
  
          if (err.status === 401) {
            this.spinner.setAuthFailed(true)
            this.service.getAuthentication().subscribe((res: any)=>{
              this.service.setToken(res.access_token);
              console.log('token set');
              let clonedReq = this.addHeaders(req)
              setTimeout(()=>{
                console.log('Overlay tiene que aparecer y durar 50 sec');
              }, 500)
              this.spinner.setAuthFailed(false)
              return next.handle(clonedReq)
            });
            console.log('Error 401');
          } else { 
            return throwError(err)
          }
          return throwError(err)
          
        })
      )
    } else {
      return next.handle(req)
    }
    
  }

  addHeaders(req: HttpRequest<any>): HttpRequest<any> {
    const clonedReq = req.clone({
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization':`Bearer ${localStorage.getItem('token')}`
      })
    });
    return clonedReq
  }

}
