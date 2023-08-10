import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TuiNotification } from '@taiga-ui/core';
import { Observable, map, shareReplay } from 'rxjs';
import { ApiService } from 'src/@core/core-service/api.service';
import { NotificationsService } from 'src/@core/core-service/notifications.service';
import { ApiResponse } from 'src/@core/models/core-response-model/response.model';
import { User, UserList } from 'src/@core/models/user.model';

type user = User | UserList | any

@Injectable({
  providedIn: 'root'
})
export class MembersService extends ApiService<user> {

  constructor(protected override http: HttpClient, private notif: NotificationsService) {
    super(http);
  }

  getAllMembers(limit: number, page: number, name?: string): Observable<ApiResponse<user>> {
    page--;
    let params: any = {
      limit: limit,
      offset: page ? limit * page : 0,
      name: name ? name : ' '
    }
    return this.get(`/user/getAllUsers`, params).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res?.errors[0]?.error?.message, 'Get all members', TuiNotification.Error)
        }
      }
    }))
  }

  postNewUser(payload: User | any): Observable<ApiResponse<any>> {
    return this.post(`/user/addNewUserForAdmin`, payload).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res?.errors[0]?.error?.message, 'Add new member', TuiNotification.Error)
        }
      }
    }))
  }

  updateUser(payload: Partial<User | any>, userID: string | null): Observable<ApiResponse<any>> {
    return this.put(`/user/updateUser/${userID}`, payload).pipe(shareReplay(), map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
      else {
        if (res.errors[0].code && ![401, 403].includes(res.errors[0].code)) {
          return this.notif.displayNotification(res?.errors[0]?.error?.message, 'Add new member', TuiNotification.Error)
        }
      }
    }))
  }
}
