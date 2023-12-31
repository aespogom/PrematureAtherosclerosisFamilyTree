import { HttpErrorResponse } from "@angular/common/http";
import { ErrorHandler, Injectable, NgZone } from "@angular/core";
import { ErrorDialogService } from "../../services/error-dialog.service";

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(
    private errorDialogService: ErrorDialogService,
    private zone: NgZone
  ) {}

  handleError(error: any) {
    // Check if it's an error from an HTTP response
    if (!(error instanceof HttpErrorResponse)) {
      // get the error object
      error['rejection'] ? error=error.rejection : error
    }
    this.zone.run(() =>
      this.errorDialogService.openDialog(
        error?.message || 'Undefined client error',
        error?.status
      )
    );

    console.error('Error from global error handler', error);
  }
}