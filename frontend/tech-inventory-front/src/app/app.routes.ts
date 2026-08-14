import { Routes } from '@angular/router';

import { MainLayoutComponent } from './core/layout/main-layout/main-layout';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login/login').then((m) => m.Login),
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'categories',
        canActivate: [authGuard],
        children: [
          {
            path: '',
            canActivate: [roleGuard],
            data: { roles: ['ADMIN', 'USER'] },
            loadComponent: () =>
              import('./features/categories/pages/category-list/category-list').then((m) => m.CategoryList),
          },
          {
            path: 'new',
            canActivate: [roleGuard],
            data: { roles: ['ADMIN'] },
            loadComponent: () =>
              import('./features/categories/pages/category-create/category-create').then((m) => m.CategoryCreate),
          },
        ],
      },
      {
        path: 'assets',
        canActivate: [authGuard],
        children: [
          {
            path: '',
            canActivate: [roleGuard],
            data: { roles: ['ADMIN', 'USER'] },
            loadComponent: () =>
              import('./features/assets/pages/asset-list/asset-list').then((m) => m.AssetList),
          },
          {
            path: 'new',
            canActivate: [roleGuard],
            data: { roles: ['ADMIN'] },
            loadComponent: () =>
              import('./features/assets/pages/asset-form/asset-form').then((m) => m.AssetForm),
          },
          {
            path: 'edit/:technicalId',
            canActivate: [roleGuard],
            data: { roles: ['ADMIN'] },
            loadComponent: () =>
              import('./features/assets/pages/asset-form/asset-form').then((m) => m.AssetForm),
          },
        ],
      },
      {
        path: 'reports',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/reports/pages/report-list/report-list').then((m) => m.ReportList),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];