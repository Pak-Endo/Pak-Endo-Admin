import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, BehaviorSubject } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';
import { User } from 'src/@core/models/user.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiResponse } from 'src/@core/models/core-response-model/response.model';
import { NotificationsService } from 'src/@core/core-service/notifications.service';
import { TuiNotification } from '@taiga-ui/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  destroy$ = new Subject();
  userID!: string;
  userData?: User;
  profileForm!: FormGroup;
  isEdit = new BehaviorSubject<boolean>(false);
  showLoader = new Subject<boolean>()

  constructor(private ac: ActivatedRoute, private auth: AuthService, private notif: NotificationsService) {
    this.initProfileForm()
    this.ac.params
    .pipe(takeUntil(this.destroy$))
    .subscribe(profileId => {
      this.fetchUserData(profileId['id'])
      this.userID = profileId['id']
    })
  }

  fetchUserData(id: string) {
    this.auth.getUserByID(id).pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.userData = user?.data;
      if(user?.data) {
        this.initProfileForm(user?.data)
      }
    })
    this.userID = id;
  }

  initProfileForm(data?: any) {
    this.profileForm = new FormGroup({
      firstName: new FormControl(data?.firstName || null, Validators.required),
      lastName: new FormControl(data?.lastName || null, Validators.required),
      email: new FormControl(data?.email || null, Validators.required),
      phoneNumber: new FormControl(data?.phoneNumber || null, Validators.required),
      city: new FormControl(data?.city || null, Validators.required),
      gender: new FormControl(data?.gender || null, Validators.required)
    })
  }

  updateProfile() {
    this.showLoader.next(true)
    this.auth.updateUserById(this.userID, this.profileForm.value).pipe(takeUntil(this.destroy$)).subscribe((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.notif.displayNotification('Profile updated successfully', 'Update Profile', TuiNotification.Success);
        this.fetchUserData(this.userID)
        this.showLoader.next(false);
        this.isEdit.next(false);
      }
      else {
        this.notif.displayNotification('Something went wrong', 'Update Profile', TuiNotification.Error);
        this.showLoader.next(false);
      }
    })
  }
}
