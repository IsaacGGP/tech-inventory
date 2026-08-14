import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatNavList, MatListItem } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  imports: [MatNavList, MatListItem, MatIcon, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent {
  readonly menuItems = [
  {
    label: 'Dashboard',
    icon: 'dashboard',
    route: '/dashboard',
  },
  {
    label: 'Categories',
    icon: 'category',
    route: '/categories',
  },
  {
    label: 'Assets',
    icon: 'inventory_2',
    route: '/assets',
  },
  {
    label: 'Reports',
    icon: 'assessment',
    route: '/reports',
  },
];
}