import { HttpService } from './../services/httpService';
import { DialogConfirmComponent } from './../dialog-confirm/dialog-confirm.component';
import { MatDialog } from '@angular/material/dialog';
import { ActiveService } from './../services/activeService';
import { BeaconSetupComponent } from './../beacon-setup/beacon-setup.component';
import { ImageClickerComponent } from './../image-clicker/image-clicker.component';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MapService } from '../services/beaconClickService';
import { ActivatedRoute } from '@angular/router';
import { Site } from '../models/site';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-beacons-container',
  templateUrl: './beacons-container.component.html',
  styleUrls: ['./beacons-container.component.scss'],
})
export class BeaconsContainerComponent implements OnInit, AfterViewInit {
  @ViewChild('beaconsView') beaconsView: ElementRef | undefined;
  @ViewChild('roomsView') roomsView: ElementRef | undefined;
  @ViewChild('overviewView') overviewView: ElementRef | undefined;
  @ViewChild('infoView') infoView: ElementRef | undefined;
  @ViewChild('projectsView') projectsView: ElementRef | undefined;
  @ViewChild('routingView') routingView: ElementRef | undefined;
  @ViewChild('hintsView') hintsView: ElementRef | undefined;


  views: any[] = [];

  @ViewChild('beaconsTab') beaconsTab: ElementRef | undefined;
  @ViewChild('roomsTab') roomsTab: ElementRef | undefined;
  @ViewChild('infoTab') infoTab: ElementRef | undefined;
  @ViewChild('overviewTab') overviewTab: ElementRef | undefined;
  @ViewChild('projectsTab') projectsTab: ElementRef | undefined;
  @ViewChild('routingTab') routingTab: ElementRef | undefined;
  @ViewChild('hintsTab') hintsTab: ElementRef | undefined;

  tabs: any[] = [];

  siteId: string = '';

  @Input('map') map: ImageClickerComponent | undefined;

  openTab(name: string) {
    let viewName = name + 'View';
    let tabName = name + 'Tab';

    this.tabs.forEach((view) => {
      if (view == undefined) {
        return;
      }
      if (view.nativeElement.id === tabName) {
        view.nativeElement.classList.add('active');
        this.beaconClickService.setActiveTab(name);
      } else {
        view.nativeElement.classList.remove('active');
      }
    });

    this.views.forEach((view) => {
      if (view == undefined) {
        return;
      }
      if (view.nativeElement.id === viewName) {
        view.nativeElement.classList.add('active');
      } else {
        view.nativeElement.classList.remove('active');
      }
    });
  }

  openOverview() {
    this.openTab('overview');
    this.activeService.setShowArea(true);
  }

  openInfo() {
    this.openTab('info');
  }

  openProjects() {
    this.openTab('projects');
  }

  openRouting() {
    this.openTab('routing');
  }

  openRooms() {
    this.openTab('rooms');
    this.activeService.setShowArea(true);
  }

  openHints() {
    this.openTab('hints');
  }

  openBeacons() {
    this.openTab('beacons');
    this.activeService.setShowBeacon(true);
  }

  onBeaconClick(_t4: string) {
    throw new Error('Method not implemented.');
  }

  saveAllClick() {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        message:
          'Are you sure you want to save all changes? This cannot be undone.',
        icon: 'warning',
        title: 'SAVE ALL CHANGES',
        color: 'yellow',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result){
      this.httpService.saveAllSiteUpdates();
      }
    });
  }

  revertAllClick() {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        message:
          'Are you sure you want to revert all changes? This cannot be undone, and all changes will be lost.',
        icon: 'error',
        title: 'REVERT ALL CHANGES',
        color: 'red',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      //console.log(result);
    });
  }

  beacons = ['Beacon 1', 'Beacon 2', 'Beacon 3'];

  constructor(
    private beaconClickService: MapService,
    private activeService: ActiveService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private http: HttpClient,
    private httpService: HttpService,
    @Inject('BASE_URL') private baseUrl: string
  ) {
    if (!this.activeService.getMaps || this.activeService.getMaps.length <= 0) {
      this.activeService.updateMaps();
    }
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      let lowerParams = new Map();
      params.keys.forEach((key) => {
        lowerParams.set(key.toLowerCase(), params.get(key));
      });
      this.siteId = lowerParams.get('siteid') || '';
    });
    this.http.get<String>(this.baseUrl + 'sites/' + this.siteId!).subscribe(
      (result: any) => {
        let newSite = Site.parseObject(result);
        if (newSite) {
          this.activeService.setSite(newSite);
        }
      },
      (error) => console.error(error)
    );
  }

  ngAfterViewInit() {
    this.views.push(this.beaconsView);
    this.views.push(this.roomsView);
    this.views.push(this.infoView);
    this.views.push(this.overviewView);
    this.views.push(this.projectsView);
    this.views.push(this.routingView);
    this.views.push(this.hintsView);

    this.tabs.push(this.beaconsTab);
    this.tabs.push(this.roomsTab);
    this.tabs.push(this.infoTab);
    this.tabs.push(this.overviewTab);
    this.tabs.push(this.projectsTab);
    this.tabs.push(this.routingTab);
    this.tabs.push(this.hintsTab);

    this.tabs.forEach((tab) => {
      if (tab.nativeElement.classList.contains('active')) {
        let tabName = tab.nativeElement.id.slice(0, -3);
        this.beaconClickService.setActiveTab(tabName);
      }
    });

    let debounce = true;

    this.beaconClickService.activeBeacon.subscribe((beaconFakeId: string) => {
      if (debounce) {
        debounce = false;
        return;
      }
      this.openBeacons();
    });
  }
}
