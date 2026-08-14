import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

import { LayoutService } from '../../services/layout/layout.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-header',
  imports: [MatToolbar, MatIconButton, MatIcon, MatTooltip],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})

export class HeaderComponent {
  private readonly layoutService = inject(LayoutService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}