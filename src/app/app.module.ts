// This file contains the logic required for:
  // Importing Dependencies: The app module imports other modules and libraries that are required by the application. This includes built-in Angular modules like BrowserModule, FormsModule, HttpClientModule, as well as custom modules created for the application.
  // Component Declarations: The app module declares the components that belong to the application. These components can be used throughout the application or shared across other modules. The declarations are specified using the declarations property of the @NgModule decorator.
  // Service Providers: The app module can specify the providers for services that need to be available throughout the application. This is done using the providers property of the @NgModule decorator. Services are typically singletons that provide functionality and data to different parts of the application.
  // Configuration: The app module can also include configuration settings specific to the application. This can include setting up routing, specifying default settings, providing environment-specific values, and more.

// Angular
import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GlobalErrorHandler } from './core/errors/global-error-handler';
import { CoreModule } from './core/core.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';

// Components
import { PatientsViewComponent } from './components/patients-view/patients-view.component';
import { TreeViewComponent } from './components/tree-view/tree-view.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { FooterComponent } from './components/footer/footer.component';
import { DialogComponent } from './components/tree-view/dialog/dialog.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { ErrorDialogComponent } from './components/errorpage/error-dialog.component';
import { customTranslate } from './loader/custom-translate.loader';


// Angular material components
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatSelectModule} from '@angular/material/select';
import {MatListModule} from '@angular/material/list';
import {MatDialogModule} from '@angular/material/dialog';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatButtonModule} from '@angular/material/button';
import {MatRadioModule} from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';


@NgModule({
  declarations: [
    AppComponent,
    PatientsViewComponent,
    TreeViewComponent,
    SidenavComponent,
    FooterComponent,
    DialogComponent,
    SpinnerComponent,
    ErrorDialogComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    MatIconModule,
    MatDividerModule,
    MatSelectModule,
    FormsModule,
    MatListModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    CoreModule,
    // Initializing TranslateModule with loader
    TranslateModule.forRoot({
      loader: {
       provide: TranslateLoader, // Main provider for loader
       useClass: customTranslate, // Custom Loader
       deps: [HttpClient], // Dependencies which helps serving loader
      }
     }),
    MatRadioModule,
    MatInputModule
  ],
  providers: [{ provide: ErrorHandler, useClass: GlobalErrorHandler },
              { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
            ],
  bootstrap: [AppComponent]
})
export class AppModule { }
