import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TuiNotification } from '@taiga-ui/core';
import { Observable, delay, map, shareReplay } from 'rxjs';
import { ApiService } from 'src/@core/core-service/api.service';
import { NotificationsService } from 'src/@core/core-service/notifications.service';
import { ApiResponse } from 'src/@core/models/core-response-model/response.model';

type DashboardResponse = any;

@Injectable({
  providedIn: 'root'
})
export class DashboardService extends ApiService<DashboardResponse> {

  constructor(protected override http: HttpClient, private notif: NotificationsService) {
    super(http)
  }

  getDashboardStatistics(): Observable<ApiResponse<any>> {
    return this.get(`/events/getEventStats`).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res?.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(
            res.errors[0]?.error?.message || 'Something went wrong',
            'Dashboard Statistics',
            TuiNotification.Error
          )
        }
      }
    }))
  }

  getCalendarEvents(limit: number, offset: number): Observable<ApiResponse<any>> {
    let params: any = {
      limit: limit,
      offset: offset
    }
    return this.get(`/events/getEventsForCalendar`, params).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res?.data
      }
    }))
  }
}
