import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavContainer, MatSidenav, MatSidenavContent } from '@angular/material/sidenav';

import { HeaderComponent } from '../header/header';
import { SidebarComponent } from '../sidebar/sidebar';
import { FooterComponent } from '../footer/footer';
import { LayoutService } from '../../services/layout/layout.service';

@Component({
  selector: 'app-main-layout',
  imports: [
    MatSidenavContainer,
    MatSidenav,
    MatSidenavContent,
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayoutComponent {
  private readonly layoutService = inject(LayoutService);

  readonly sidebarOpen = this.layoutService.sidebarOpen;
}