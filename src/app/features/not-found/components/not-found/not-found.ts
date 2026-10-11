import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon } from '@ng-icons/core';

@Component({
  imports: [NgIcon],
  selector: 'app-not-found',
  styleUrl: './not-found.css',
  templateUrl: './not-found.html',
})
export class NotFound {
  private readonly router = inject(Router);

  goDashboard():void{
    this.router.navigate(['app/dashboard']);
  }

  goTransctions():void{
    this.router.navigate(['app/transactions']);
  }
}
