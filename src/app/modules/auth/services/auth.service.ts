import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { getItem, setItem, StorageItem } from '../../../../@core/utils/local-storage.utils';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, exhaustMap, finalize, map, shareReplay, tap } from 'rxjs/operators';
import { RegisterModel } from '../../../../@core/models/register.model';
import { AuthCredentials } from '../../../../@core/models/auth-credentials.model';
import { ApiResponse } from '../../../../@core/models/core-response-model/response.model'
import { SignInResponse } from '../../../../@core/models/sign-in-response.model';
import { User } from '../../../../@core/models/user.model';
import { ApiService } from '../../../../@core/core-service/api.service';
import { TuiNotification } from '@taiga-ui/core';
import { NotificationsService } from 'src/@core/core-service/notifications.service';

/**
 * @type {SignInResponse | any}
 */
type AuthApiData = SignInResponse | any;

/**
 * The service for handling authentication related tasks.
 * @extends ApiService
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService extends ApiService<AuthApiData> {

  public currentUser$: Observable<User | null>;
  public isLoading$: Observable<boolean>;
  private currentUserSubject: BehaviorSubject<User | null>;
  private isLoadingSubject: BehaviorSubject<boolean>;

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public set currentUserValue(user: User | null) {
    this.currentUserSubject.next(user);
  }

  public get JwtToken(): string {
    return getItem(StorageItem.JwtToken)?.toString() || '';
  }

  constructor(
    protected override http: HttpClient,
    private router: Router,
    private notif: NotificationsService
  ) {
    super(http);
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.currentUserSubject = new BehaviorSubject<User | null>(<User>getItem(StorageItem.User));
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.isLoading$ = this.isLoadingSubject.asObservable();

  }

  /**
   *
   * @param {AuthCredentials} params
   * @returns The user object and jwt token
   */
  public login(params: AuthCredentials): Observable<ApiResponse<AuthApiData>> {
    this.isLoadingSubject.next(true);
    return this.post('/auth/loginAdmin', params).pipe(
      map((result: ApiResponse<any>) => {
        if (!result.hasErrors()) {
          setItem(StorageItem.User, result?.data?.user || null);
          setItem(StorageItem.JwtToken, result?.data?.token || null);
          if(result?.data?.user)
          this.currentUserSubject.next(result?.data?.user);
          return result
        }
        else {
          this.notif.displayNotification(result.errors[0]?.error?.message || 'Failed to authenticate', 'Login Failed!', TuiNotification.Error);
          return null
        }
      }),
      exhaustMap((res) => {
        if (res?.data?.user) {
          return this.get(`/user/getUserById/${res.data.user.id}`)
        } else {
          return of(null);
        }
      }),
      tap((res) => {
        if(res && !res?.hasErrors()) {
          this.updateUser(res.data)
        }
      }),
      catchError((err) => {
        return of(err);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  public sendForgotPassEmail(email: string): Observable<ApiResponse<any>> {
    return this.post(`/auth/forgotPassword/${email}`).pipe(map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
      else {
        return this.notif.displayNotification(res.errors[0]?.error?.message || 'Something went wrong. Please try again', 'Forgot Password!', TuiNotification.Error);
      }
    }))
  }

  public resetPassword(resetPasswordValue: any): Observable<ApiResponse<any>> {
    return this.post(`/auth/resetPassword`, resetPasswordValue)
    .pipe(map((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        return res.data
      }
      else {
        return this.notif.displayNotification(res.errors[0]?.error?.message || 'Something went wrong. Please try again', 'Reset Password!', TuiNotification.Error);
      }
    }))
  }

   /**
   *
   *
   * @returns void
   */
  public logout(): void {
    this.currentUserSubject.next(null);
    localStorage.clear()
    this.router.navigate(['/auth/login'], {
      queryParams: {},
    });
  }

  /**
   *
   * @param {RegisterModel} user
   * @returns The user object after registration sucess
   */
  public registration(user: RegisterModel | User | any) {
    this.isLoadingSubject.next(true);
    return this.post('/auth/signup',user).pipe(
      map((user: ApiResponse<SignInResponse>) => {
        this.isLoadingSubject.next(false);
        this.notif.displayNotification('Member added successfully', 'Add new member', TuiNotification.Success)
        return user;
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  public getUserByID(userID: string): Observable<ApiResponse<any>> {
    return this.get(`/user/getUserById/${userID}`).pipe(shareReplay())
  }

  public updateUser(user:User) {
    if (user) {
      this.currentUserSubject.next(user);
      setItem(StorageItem.User, user);
    }
  }
}
