import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationsService } from 'src/@core/core-service/notifications.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { TuiNotification } from '@taiga-ui/core';
import { ConfirmedValidator } from 'src/app/custom-validators/password.validator';

@Component({
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetPasswordComponent {
  resetPassForm!: FormGroup;
  isResetting = new Subject<boolean>();
  destroy$ = new Subject();
  userID!: string;

  constructor(
    private auth: AuthService,
    private router: Router,
    private notif: NotificationsService,
    private fb: FormBuilder,
    private ac: ActivatedRoute
  ) {
    this.initresetPassForm();
    this.ac.queryParams.pipe(takeUntil(this.destroy$)).subscribe(val => {
      this.userID = val['id'];
    })
  }

  get f() {
    return this.resetPassForm.controls;
  }

  initresetPassForm() {
    this.resetPassForm = this.fb.group({
      newPassword: new FormControl(null, Validators.compose([
        Validators.required,
        Validators.minLength(8)
      ])),
      confirmPassword: new FormControl(null, Validators.compose([
        Validators.required
      ]))
    }, {
      validator: ConfirmedValidator('newPassword', 'confirmPassword')
    })
  }

  onSubmit() {
    if(this.resetPassForm.invalid) {
      this.resetPassForm.markAllAsTouched()
      return this.resetPassForm.markAsDirty()
    }
    this.isResetting.next(true)
    this.auth.resetPassword(Object.assign(this.resetPassForm.value, {userID: this.userID}))
    .pipe(takeUntil(this.destroy$)).subscribe(response => {
      if(response) {
        this.isResetting.next(false);
        this.notif.displayNotification('Password successfully reset. You can now login!', 'Reset Password', TuiNotification.Success);
        this.router.navigate(['/auth/login'])
      }
      else {
        this.isResetting.next(false);
      }
    })
  }

}
