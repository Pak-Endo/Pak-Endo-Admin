import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiAvatarModule } from '@taiga-ui/kit';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { User } from 'src/@core/models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, TuiAvatarModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  currentUser: User | any;
  
  constructor(private auth: AuthService) {
    this.currentUser = this.auth.currentUserValue
  }
}
