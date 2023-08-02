import { Inject, Injectable } from '@angular/core';
import { TuiAlertService, TuiNotificationT } from '@taiga-ui/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  constructor(
    @Inject(TuiAlertService)
    private readonly alertService: TuiAlertService
  ) { }

  displayNotification(message: string, label: string, status: TuiNotificationT) {
    this.alertService.open(message,
    {
      label: label,
      status: status,
      autoClose: true
    }
      ).subscribe();
  }
}