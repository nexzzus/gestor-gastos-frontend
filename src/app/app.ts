import { Component, inject, NgZone, OnInit } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { App as AppCapacitor } from '@capacitor/app';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit{
  private readonly router = inject(Router);
  private readonly zone = inject(NgZone);

  ngOnInit() {
    if (!Capacitor.isNativePlatform()) return;

    AppCapacitor.addListener('appUrlOpen', ({ url }) => {
      if (!url.startsWith('com.mateo.gestorgastos://auth/callback')) return;

      const token = new URLSearchParams(url.split('?')[1] ?? '').get('token');

      // Los eventos de Capacitor llegan fuera de Angular, por eso zone.run
      this.zone.run(() => {
        if (token) {
          this.router.navigate(['/auth/callback'], { queryParams: { token } });
        } else {
          this.router.navigate(['/login']);
        }
      });
    });
  }
}
