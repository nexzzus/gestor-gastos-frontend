import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matCloseOutline, matMenuOutline } from '@ng-icons/material-symbols/outline';
import { Navbar } from '@core/layout/navbar/navbar';

@Component({
  imports: [RouterOutlet, Sidebar, Navbar],
  selector: 'app-main-layout',
  styleUrl: './main-layout.css',
  templateUrl: './main-layout.html',
  providers: [provideIcons({ matCloseOutline, matMenuOutline })],
})
export class MainLayout {
  isSidebarOpen = false;

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }
}
