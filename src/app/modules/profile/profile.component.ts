import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, BehaviorSubject } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';
import { User } from 'src/@core/models/user.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';

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

  constructor(private ac: ActivatedRoute, private auth: AuthService) {
    this.initProfileForm()
    this.ac.params
    .pipe(takeUntil(this.destroy$))
    .subscribe(profileId => {
      this.auth.getUserByID(profileId['id']).pipe(takeUntil(this.destroy$)).subscribe(user => {
        this.userData = user?.data;
        if(user?.data) {
          this.initProfileForm(user?.data)
        }
      })
      this.userID = profileId['id']
    })
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
}
