import { HintsComponent } from './hints/hints.component';
import { RoutingComponentComponent } from './routing-component/routing-component.component';
import { ContainerProjectsViewComponent } from './container-projects-view/container-projects-view.component';
import { MyProjectsComponent } from './my-projects/my-projects.component';
import { CreateProjectComponent } from './create-project/create-project.component';
import { MyMapsComponent } from './my-maps/my-maps.component';
import { DialogConfirmComponent } from './dialog-confirm/dialog-confirm.component';
import { SectionListComponent } from './section-list/section-list.component';
import { SectionSetupComponent } from './section-setup/section-setup.component';
import { ActiveService } from './services/activeService';
import { MapSetupComponent } from './map-setup/map-setup.component';
import { CreateSitePageComponent } from './create-site-page/create-site-page.component';
import { CreateNetworkDeviceComponent } from './create-network-device/create-network-device.component';
import { MyNetworkDevicesComponent } from './my-network-devices/my-network-devices.component';
import { MySitesComponent } from './my-sites/my-sites.component';
import { HttpService } from './services/httpService';
import { SitePageComponent } from './site-page/site-page.component';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';

import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { HomeComponent } from './home/home.component';
import { CounterComponent } from './counter/counter.component';
import { FetchDataComponent } from './fetch-data/fetch-data.component';

import { AppRoutingModule } from './app-routing.module';
import { ImageClickerComponent } from './image-clicker/image-clicker.component';
import { BeaconsContainerComponent } from './beacons-container/beacons-container.component';

import { NgbModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { SiteSetupComponent } from './site-setup/site-setup.component';
import { BeaconSetupComponent } from './beacon-setup/beacon-setup.component';
import { RoomSetupComponent } from './room-setup/room-setup.component';
import { MapService } from './services/beaconClickService';
import { OverviewSetupComponent } from './overview-setup/overview-setup.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {MatRadioModule} from '@angular/material/radio';
import {MatButtonModule} from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import {MatPaginatorModule} from '@angular/material/paginator';

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    CounterComponent,
    FetchDataComponent,
    ImageClickerComponent,
    BeaconsContainerComponent,
    SiteSetupComponent,
    BeaconSetupComponent,
    RoomSetupComponent,
    SitePageComponent,
    MySitesComponent,
    MyNetworkDevicesComponent,
    CreateNetworkDeviceComponent,
    CreateSitePageComponent,
    OverviewSetupComponent,
    MapSetupComponent,
    SectionSetupComponent,
    SectionListComponent,
    DialogConfirmComponent,
    MyMapsComponent,
    CreateProjectComponent,
    MyProjectsComponent,
    ContainerProjectsViewComponent,
    RoutingComponentComponent,
    HintsComponent
  ],
  providers: [
    MapService,
    HttpService,
    ActiveService
  ],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatRadioModule,
    MatButtonModule,
    MatIconModule,
    FontAwesomeModule,
    NgbDropdownModule,
    MatPaginatorModule
  ],
})
export class AppModule {}
