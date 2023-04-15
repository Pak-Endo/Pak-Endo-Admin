import { HttpClient, HttpErrorResponse, HttpEventType, HttpHeaders, HttpParams, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { ApiResponse, ErrorCode } from '../models/core-response-model/response.model';

const headersConfig = {
  'LOCALE': 'en',
  'Accept': 'application/json',
  'access-control-allow-origin': '*'
};

/**
 * A base class service for handling api calls generically
 */
@Injectable({
  providedIn: 'root'
})

/**
 * The class that every service in the project will extend to handle apis
 */
export class ApiService<T> {

  constructor(
    protected http: HttpClient
  ) { }

  /**
   *
   * @returns HttpHeaders to attach to Server request
   */
  private setHeaders(): HttpHeaders {
    const header = {
      ...headersConfig,
      'Content-Type': 'application/json',
    };
    return new HttpHeaders(header);
  }

  /**
   *
   * @param {string} path
   * @param {any} params
   * @returns The response will be an Observable object. See {@link ApiResponse} for more details
   */
  public get(
    path: string,
    params?: any
  ): Observable<ApiResponse<T>> {
    const options = {
      params: new HttpParams({ fromString: this.objectToQueryString(params) }),
      headers: this.setHeaders()
    };
    return this.mapAndCatchError<T>(
      this.http.get<ApiResponse<T>>(`${environment.apiUrl}${path}`, options)
    );
  }

  /**
   *
   * @param {string} path
   * @param {object} body
   * @returns The response will be an Observable object. See {@link ApiResponse} for more details
   */
  public post(
    path: string,
    body: Object = {}
  ): Observable<ApiResponse<T>> {
    const options = { headers: this.setHeaders() };
    return this.mapAndCatchError<T>(
      this.http.post<ApiResponse<T>>(
        `${environment.apiUrl}${path}`,
        JSON.stringify(body),
        options
      )
    );
  }

  /**
   *
   * @param {string} path
   * @param {object} body
   * @param {number }progress
   * @returns The progress of the media upload request along with the response from server
   */

  public postMediaProgress(path: string, body: any = {}, progress: number): Observable<ApiResponse<T>> {
    return new Observable((success) => {
      const req = new HttpRequest('POST', `${environment.apiUrl}${path}`, body, {
        reportProgress: true
      });
     this.http.request(req).subscribe((event: any) => {
        switch (event.type) {
          case HttpEventType.Sent:
            break;
          case HttpEventType.ResponseHeader:
            break;
          case HttpEventType.UploadProgress:
            progress = Math.round(event.loaded / event.total * 100);
            break;
          case HttpEventType.Response:
            success.next(event.body);
            setTimeout(() => {
            progress = 0;
          }, 0);
        }
      })
    })
  }

  /**
   *
   * @param {string} path
   * @param {object} body
   * @returns The response will be an Observable object. See {@link ApiResponse} for more details
   */
  public put(
    path: string,
    body: Object = {}
  ): Observable<ApiResponse<T>> {
    const options = { headers: this.setHeaders() };
    return this.mapAndCatchError<T>(
      this.http.put<ApiResponse<T>>(
        `${environment.apiUrl}${path}`,
        JSON.stringify(body),
        options
      )
    );
  }

  /**
   *
   * @param {string} path
   * @param {object} body
   * @returns The response will be an Observable object. See {@link ApiResponse} for more details
   */
  public delete(
    path: string,
    body: Object = {}
  ): Observable<ApiResponse<T>> {
    const options = {
      headers: this.setHeaders(),
      body: JSON.stringify(body)
    };
    return this.mapAndCatchError<T>(
      this.http.delete<ApiResponse<T>>(`${environment.apiUrl}${path}`, options)
    );
  }

  /**
   *
   * @param {object} obj
   * @returns takes an object as an argument and returns a query string to attach to the request url and send as queryparams
   */
  private objectToQueryString(obj: any): string {
    const str = [];
    for (const p in obj)
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
      }
    return str.join('&');
  }

  /**
   *
   * @param {Observable} response
   * @returns An Observable of type -> See {@link ApiResponse}
   */
  private mapAndCatchError<TData>(
    response: Observable<any>
  ): Observable<ApiResponse<TData>> {
    return response.pipe(
      retry(2),
      map((r: ApiResponse<TData>) => {
        const result = new ApiResponse<TData>();
        Object.assign(result, r);
        return result;
      }),
      catchError((err: HttpErrorResponse) => {
        const result = new ApiResponse<TData>();
        // if err.error is not ApiResponse<TData> e.g. connection issue
        if (
          err.error instanceof ErrorEvent ||
          err.error instanceof ProgressEvent
        ) {
          result.errors.push({
            code: ErrorCode.UnknownError,
            text: 'Unknown error.'
          });
        } else {
          result.errors.push({
            code: err.status,
            text: err.message,
            error: err.error
          });
        }
        return of(result);
      })
    );
  }
}
