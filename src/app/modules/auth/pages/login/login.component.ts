import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject, first, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NotificationsService } from 'src/@core/core-service/notifications.service';
import { TuiNotification } from '@taiga-ui/core';

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnDestroy {
  loginForm!: FormGroup;
  isSigningIn = new Subject<boolean>();
  destroy$ = new Subject();

  constructor(private auth: AuthService, private router: Router, private notif: NotificationsService) {
    this.initloginForm();
  }

  get f() {
    return this.loginForm.controls;
  }

  initloginForm() {
    this.loginForm = new FormGroup({
      email: new FormControl(null, Validators.compose([
        Validators.required,
        Validators.email
      ])),
      password: new FormControl(null, Validators.compose([
        Validators.required,
        Validators.minLength(8)
      ]))
    })
  }

  onSubmit() {
    if(this.loginForm.invalid) {
      return this.loginForm.markAllAsTouched()
    }
    this.isSigningIn.next(true)
    this.auth.login(this.loginForm.value).pipe(takeUntil(this.destroy$), first()).subscribe(response => {
      if(response) {
        this.isSigningIn.next(false);
        this.notif.displayNotification('You have logged in successfully', 'User Login', TuiNotification.Success);
      }
      else {
        this.isSigningIn.next(false);
      }
    })
  }


  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

}
