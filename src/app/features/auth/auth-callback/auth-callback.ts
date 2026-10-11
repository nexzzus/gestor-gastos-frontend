import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {AuthService} from '@core/services/auth-service';
import {HotToastService} from "@ngxpert/hot-toast";
import { UserResponseModel } from '@core/models/user.model';

@Component({
  imports: [],
  selector: 'app-auth-callback',
  styleUrl: './auth-callback.css',
  templateUrl: './auth-callback.html',
})
export class AuthCallback implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(HotToastService);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const accessToken = params['token'];
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        this.getUser();
        this.router.navigate(['app/dashboard']);
      } else {
        this.router.navigate(['login']);
      }
    })
  }

  getUser(){
      this.authService.getMe().pipe(
          this.toast.observe({
              loading: "Cargando perfíl...",
              success: "Perfíl cargado",
              error: "Error al cargar el perfíl"
          })
      ).subscribe({
          next:  (user: UserResponseModel) => {
              localStorage.setItem('user', JSON.stringify(user));
          },
          error: err => {
              this.toast.error(err.error?.message || "Ocurrió un error al cargar el perfil");
          }
      });
  }
}
