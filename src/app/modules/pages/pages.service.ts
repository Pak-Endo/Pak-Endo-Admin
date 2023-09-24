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

  getSpeakerById(speakerID: string): Observable<ApiResponse<any>> {
    return this.get(`/speakers/getSpeakerByID/${speakerID}`).pipe(shareReplay())
  }

  // Sposnors
  getAllSponsors(limit: number, page: number, sponsorName?: string): Observable<ApiResponse<any>> {
    page--;
    let params: any = {
      limit: limit,
      offset: page ? limit * page : 0,
      name: sponsorName ? sponsorName : ''
    }
    return this.get(`/sponsors/getAllSponsors`, params).pipe(shareReplay())
  }

  addNewSponsor(payload: any): Observable<ApiResponse<any>> {
    return this.post(`/sponsors/addSponsor`, payload).pipe(shareReplay())
  }

  updateSponsor(payload: any, sponsorID: string | null): Observable<ApiResponse<any>> {
    return this.put(`/sponsors/updateSponsor/${sponsorID}`, payload).pipe(shareReplay())
  }

  deleteSponsor(sponsorID: string | null): Observable<ApiResponse<any>> {
    return this.delete(`/sponsors/deleteSponsor/${sponsorID}`).pipe(shareReplay())
  }

  // Venues
  getAllVenues(limit: number, page: number, venueName?: string): Observable<ApiResponse<any>> {
    page--;
    let params: any = {
      limit: limit,
      offset: page ? limit * page : 0,
      name: venueName ? venueName : ''
    }
    return this.get(`/venues/getAllVenues`, params).pipe(shareReplay())
  }

  getVenueById(venueID: string): Observable<ApiResponse<any>> {
    return this.get(`/venues/getVenueByID/${venueID}`).pipe(shareReplay())
  }

  addNewVenue(payload: any): Observable<ApiResponse<any>> {
    return this.post(`/venues/addVenue`, payload).pipe(shareReplay())
  }

  updateVenue(payload: any, venueID: string | null): Observable<ApiResponse<any>> {
    return this.put(`/venues/updateVenue/${venueID}`, payload).pipe(shareReplay())
  }

  deleteVenue(venueID: string | null): Observable<ApiResponse<any>> {
    return this.delete(`/venues/deleteVenue/${venueID}`).pipe(shareReplay())
  }
}
