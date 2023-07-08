import { MyProjectsComponent } from './my-projects/my-projects.component';
import { CreateProjectComponent } from './create-project/create-project.component';
import { MapSetupComponent } from './map-setup/map-setup.component';
import { CreateNetworkDeviceComponent } from './create-network-device/create-network-device.component';
import { MyNetworkDevicesComponent } from './my-network-devices/my-network-devices.component';
import { MySitesComponent } from './my-sites/my-sites.component';
import { CreateSitePageComponent } from './create-site-page/create-site-page.component';
import { SitePageComponent } from './site-page/site-page.component';
import { HomeComponent } from 'src/app/home/home.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CounterComponent } from './counter/counter.component';
import { FetchDataComponent } from './fetch-data/fetch-data.component';
import { MyMapsComponent } from './my-maps/my-maps.component';

const routes: Routes =  [{ path: '', component: HomeComponent, pathMatch: 'full' },
{ path: 'counter', component: CounterComponent },
{ path: 'site', component: SitePageComponent },
{ path: 'create-site', component: CreateSitePageComponent },
{ path: 'my-sites', component: MySitesComponent },
{ path: 'my-maps', component: MyMapsComponent },
{ path: 'create-map', component: MapSetupComponent },
{ path: 'manage-project', component: CreateProjectComponent },
{ path: 'my-projects', component: MyProjectsComponent },
{ path: 'manage-device', component: CreateNetworkDeviceComponent },
{ path: 'my-devices', component: MyNetworkDevicesComponent },
{ path: 'fetch-data', component: FetchDataComponent},]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }