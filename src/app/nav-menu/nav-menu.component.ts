import { Globals } from './../services/globals';
import { Component } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { HttpService } from '../services/httpService';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css'],
})
export class NavMenuComponent {

  submitPassword() {
    this.httpService.adminPassword = this.adminPassword;
  }

  updatePassword($event: Event) {
    this.adminPassword = ($event.target as HTMLInputElement).value;
  }

  public isAuthenticated?: Observable<boolean> = of(true);
  public userName?: Observable<string | null | undefined> = of('User');
  adminPassword: string = this.httpService.adminPassword;

  ngOnInit() {}

  constructor(private httpService: HttpService) {
  }

  isExpanded = false;

  collapse() {
    this.isExpanded = false;
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
  }
}
