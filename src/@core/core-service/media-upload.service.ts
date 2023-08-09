import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service'
import { HttpClient } from '@angular/common/http';
import { ResponseAddMedia } from '../models/media-upload.model';
import { ApiResponse } from '../models/core-response-model/response.model';

type uploadMedia = ResponseAddMedia | any;

@Injectable({
  providedIn: 'root'
})

export class MediaUploadService extends ApiService<uploadMedia> {
  uploadCount = new BehaviorSubject<number>(1);

  constructor(protected override http: HttpClient) {
    super(http);
  }

  uploadMedia(folderName: string, file:any): Observable<ApiResponse<uploadMedia>> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    return this.postMedia(`/media-upload/mediaFiles/${folderName}`, formData);
  }

  uploadMediaWithProgress(folderName: string, file:any, fileCount: number): Observable<ApiResponse<uploadMedia>> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    return this.postMedia(`/media-upload/mediaFiles/${folderName}`, formData).pipe(tap((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        let currentVal = this.uploadCount.value;
        let newCount = currentVal + 1;
        this.uploadCount.next(newCount);
        if(this.uploadCount.value == fileCount) {
          this.uploadCount.complete();
        }
      }
    }));
  }
}