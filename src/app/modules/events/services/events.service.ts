import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TuiNotification } from '@taiga-ui/core';
import { Observable, map, shareReplay } from 'rxjs';
import { ApiService } from 'src/@core/core-service/api.service';
import { NotificationsService } from 'src/@core/core-service/notifications.service';
import { ApiResponse } from 'src/@core/models/core-response-model/response.model';
import { EventData, EventModel } from 'src/@core/models/events.model';

type event = EventModel | EventData | any

@Injectable({
  providedIn: 'root'
})
export class EventsService extends ApiService<event> {

  constructor(protected override http: HttpClient, private notif: NotificationsService) {
    super(http)
  }

  getAllEvents(limit: number, page: number, title: string): Observable<ApiResponse<event>> {
    page--;
    let params: any = {
      limit: limit,
      offset: page ? limit * page : 0,
      title: title ? title : ' '
    }
    return this.get(`/events/getllEvents`, params).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res?.errors[0]?.error?.message, 'Get all events', TuiNotification.Error)
        }
      }
    }))
  }

  createNewEvent(payload: EventData): Observable<ApiResponse<any>> {
    return this.post(`/events/createNewEvent`, payload).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('Event created successfully', 'Create Event', TuiNotification.Success)
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res?.errors[0]?.error?.message, 'Create Event', TuiNotification.Error)
        }
      }
    }))
  }

  updateEvent(payload: EventData, eventID: string | null): Observable<ApiResponse<any>> {
    return this.put(`/events/updateEvent/${eventID}`, payload).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('Event updated successfully', 'Update Event', TuiNotification.Success)
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res?.errors[0]?.error?.message, 'Update Event', TuiNotification.Error)
        }
      }
    }))
  }

  deleteEvent(eventID: string | null): Observable<ApiResponse<any>> {
    return this.delete(`/events/deleteEvent/${eventID}`).pipe(map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('Event succesfully removed', 'Delete Event', TuiNotification.Success)
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res?.errors[0]?.error?.message, 'Delete Event', TuiNotification.Error)
        }
      }
    }))
  }
  
  getEventByID(eventID: string): Observable<ApiResponse<any>> {
    return this.get(`/events/getEventByID/${eventID}`).pipe(map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res?.errors[0]?.error?.message, 'Fetch Event', TuiNotification.Error)
        }
      }
    }))
  }
}
