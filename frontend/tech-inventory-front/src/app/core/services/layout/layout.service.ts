import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly _sidebarOpen = signal(true);

  readonly sidebarOpen = this._sidebarOpen.asReadonly();

  toggleSidebar(): void {
    this._sidebarOpen.update((open) => !open);
  }

  openSidebar(): void {
    this._sidebarOpen.set(true);
  }

  closeSidebar(): void {
    this._sidebarOpen.set(false);
  }
}