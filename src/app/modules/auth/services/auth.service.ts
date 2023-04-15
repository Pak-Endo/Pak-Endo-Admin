import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { getItem, setItem, StorageItem } from '../../../../@core/utils/local-storage.utils';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, exhaustMap, finalize, map, tap } from 'rxjs/operators';
import { RegisterModel } from '../../../../@core/models/register.model';
import { AuthCredentials } from '../../../../@core/models/auth-credentials.model';
import { ApiResponse } from '../../../../@core/models/core-response-model/response.model'
import { SignInResponse } from '../../../../@core/models/sign-in-response.model';
import { User } from '../../../../@core/models/user.model';
import { ApiService } from '../../../../@core/core-service/api.service';

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
    private router: Router
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
  public login(params: AuthCredentials) {
    this.isLoadingSubject.next(true);
    return this.post('/api/auth/login', params).pipe(
      map((result: ApiResponse<any>) => {
        console.log('result',result);
        if (!result.hasErrors()) {
          setItem(StorageItem.User, result?.data?.user || null);
          setItem(StorageItem.JwtToken, result?.data?.token || null);
          if(result?.data?.user)
          this.currentUserSubject.next(result?.data?.user);
          return result
        }
        else {
          throw result.errors[0]?.error?.message
        }
      }),
      exhaustMap((res)=>{
        if (res?.data?.user) {
          return this.get(`/api/user/getUserByID/${res.data.user.id}`)
        } else {
          return of(null);
        }
      }),
      tap((res)=> {
        if(res && !res?.hasErrors()) {
          this.updateUser(res.data)
        }
      }),
      catchError((err) => {
        console.error('err', err);
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

   /**
   *
   *
   * @returns void
   */
  public logout(): void {
    this.currentUserSubject.next(null);
    setItem(StorageItem.User, null);
    setItem(StorageItem.JwtToken, null);
    this.router.navigate(['/auth/login'], {
      queryParams: {},
    });
  }

  /**
   *
   * @param {RegisterModel} user
   * @returns The user object after registration sucess
   */
  public registration(user: RegisterModel) {
    this.isLoadingSubject.next(true);
    return this.post('/api/auth/signup',user).pipe(
      map((user:ApiResponse<SignInResponse>) => {
        this.isLoadingSubject.next(false);
        return user;
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  public updateUser(user:User) {
    if (user) {
      this.currentUserSubject.next(user);
      setItem(StorageItem.User, user);
    }
  }
}
