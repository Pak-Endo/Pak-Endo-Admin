import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiAvatarModule } from '@taiga-ui/kit';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { User } from 'src/@core/models/user.model';
import {TuiTabBarModule} from '@taiga-ui/addon-mobile';
import {TuiHostedDropdownModule, TuiNotificationModule, TuiSvgModule} from '@taiga-ui/core';
import {TuiSidebarModule} from '@taiga-ui/addon-mobile';
import {TuiActiveZoneModule} from '@taiga-ui/cdk';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, TuiAvatarModule, TuiTabBarModule, TuiHostedDropdownModule, TuiSvgModule, TuiSidebarModule, TuiActiveZoneModule, TuiNotificationModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  currentUser: User | any;
  open = false;
  openSideNav = false
  
  constructor(private auth: AuthService) {
    this.currentUser = this.auth.currentUserValue
  }

  toggle(openSideNav: boolean) {
    this.openSideNav = openSideNav;
  }
}
