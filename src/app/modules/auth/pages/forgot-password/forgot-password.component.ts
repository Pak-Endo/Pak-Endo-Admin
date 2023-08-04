import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NotificationsService } from 'src/@core/core-service/notifications.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { TuiNotification } from '@taiga-ui/core';

@Component({
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPasswordComponent implements OnDestroy {
  forgotPassForm!: FormGroup;
  isSendingEmail = new Subject<boolean>();
  destroy$ = new Subject();

  constructor(private auth: AuthService, private router: Router, private notif: NotificationsService) {
    this.initloginForm();
  }

  get f() {
    return this.forgotPassForm.controls;
  }

  initloginForm() {
    this.forgotPassForm = new FormGroup({
      email: new FormControl(null, Validators.compose([
        Validators.required,
        Validators.email
      ]))
    })
  }

  onSubmit() {
    if(this.forgotPassForm.invalid) {
      return this.forgotPassForm.markAllAsTouched()
    }
    this.isSendingEmail.next(true)
    this.auth.sendForgotPassEmail(this.f['email']?.value)
    .pipe(takeUntil(this.destroy$)).subscribe(res => {
      if(res) {
        this.isSendingEmail.next(false)
        this.notif.displayNotification(res?.data?.message, 'Forgot Password', TuiNotification.Success);
      }
      else {
        this.isSendingEmail.next(false)
      }
    })
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
