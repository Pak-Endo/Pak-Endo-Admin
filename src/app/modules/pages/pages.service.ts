import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from 'src/@core/core-service/api.service';
import { ApiResponse } from 'src/@core/models/core-response-model/response.model';
import { Observable, share, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PagesService extends ApiService<any> {

  constructor(protected override http: HttpClient) {
    super(http)
  }
  
  getAllSpeakers(limit: number, page: number, speakerName?: string): Observable<ApiResponse<any>> {
    page--;
    let params: any = {
      limit: limit,
      offset: page ? limit * page : 0,
      name: speakerName ? speakerName : ''
    }
    return this.get(`/speakers/getAllSpeakers`, params).pipe(shareReplay())
  }

  addNewSpeaker(payload: any): Observable<ApiResponse<any>> {
    return this.post(`/speakers/addSpeaker`, payload).pipe(shareReplay())
  }

  updateSpeaker(payload: any, speakerID: string | null): Observable<ApiResponse<any>> {
    return this.put(`/speakers/updateSpeaker/${speakerID}`, payload).pipe(shareReplay())
  }

  deleteSpeaker(speakerID: string | null): Observable<ApiResponse<any>> {
    return this.delete(`/speakers/deleteSpeaker/${speakerID}`).pipe(shareReplay())
  }
}
