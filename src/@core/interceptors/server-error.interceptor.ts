import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TuiNotification } from '@taiga-ui/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { NotificationsService } from '../core-service/notifications.service';

@Injectable()
export class ServerErrorInterceptor implements HttpInterceptor {
  constructor(
    private auth: AuthService,
    private notif: NotificationsService
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if ([401, 403].includes(error.status) && this.auth.currentUserValue) {
          this.auth.logout();
          this.notif.displayNotification('Your session has expired. Log in again to continue', 'Session Expired', TuiNotification.Error)
          return throwError(error)
        } else if (error.status === 500) {
          return throwError(error);
        } else {
          return throwError(error);
        }
      }),
    );
  }
}
