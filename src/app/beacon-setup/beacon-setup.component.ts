import { SiteMap } from './../models/siteMap';
import { ActiveService } from './../services/activeService';
import { MapService } from './../services/beaconClickService';
import { ImageClickerComponent } from './../image-clicker/image-clicker.component';
import { Beacon } from './../models/beacon';
import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  ContentChildren,
  QueryList,
  Input,
  Inject,
} from '@angular/core';
import { NetworkDevice } from '../models/networkDevice';
import { HttpClient } from '@angular/common/http';
import { HttpService } from '../services/httpService';
import { time } from 'console';

@Component({
  selector: 'app-beacon-setup',
  templateUrl: './beacon-setup.component.html',
  styleUrls: ['./beacon-setup.component.scss'],
})
export class BeaconSetupComponent implements OnInit, AfterViewInit {
  updateBeaconLocationY(event: Event) {
    this.selectedBeacon!.locationY = Number(
      (event.target as HTMLInputElement).value
    );
    this.beaconsUpdated();
  }
  updateBeaconLocationX(event: Event) {
    this.selectedBeacon!.locationX = Number(
      (event.target as HTMLInputElement).value
    );
    this.beaconsUpdated();
  }
  updateBeaconID(event: Event) {
    this.selectedBeacon!.networkDeviceId = (
      event.target as HTMLInputElement
    ).value;
    this.beaconsUpdated();
  }
  updateBeaconRange(event: Event) {
    this.selectedBeacon!.range = Number(
      (event.target as HTMLInputElement).value
    );
    this.beaconsUpdated();
  }
  updateBeaconName(event: Event) {
    let target = event.target as HTMLInputElement;
    let sameNameBeacons = this.beacons.find(
      (b) => b.beaconName === target.value
    );
    if (!sameNameBeacons || sameNameBeacons === this.selectedBeacon) {
      target.style.color = 'black';
      this.selectedBeacon!.beaconName = (
        event.target as HTMLInputElement
      ).value;
      this.beaconDropdown!.nativeElement.innerHTML =
        this.selectedBeacon!.beaconName!;
      this.beaconsUpdated();
    } else {
      target.style.color = 'red';
    }
  }
  updateBeaconInfo() {
    throw new Error('Method not implemented.');
  }

  removeBeacon() {
    let index = this.beacons.indexOf(this.selectedBeacon!);
    this.beacons = this.beacons.filter(
      (beacon) => beacon !== this.selectedBeacon
    );
    if (index > 0) {
      this.selectedBeacon = this.beacons[index - 1];
    } else {
      this.selectedBeacon = undefined;
    }
    if (this.currMap !== undefined) {
      this.currMap!.beacons = this.beacons;
    }
    this.beaconsUpdated();
  }
  beaconsExist: boolean = false;
  beacons: Beacon[] = [];
  selectedBeacon: Beacon | undefined;
  currMap: SiteMap | undefined;

  @ViewChild('beaconDropdown') beaconDropdown: ElementRef | undefined;
  @ViewChild('dropdownDiv') dropdownDiv: ElementRef | undefined;

  map: any | undefined;

  networkDevices: NetworkDevice[] = [];

  addBeacon() {
    let newBeacon = new Beacon('Beacon ' + (this.beacons.length + 1), '', 0, 0);
    newBeacon.sectionId = this.currMap?.mapId ?? undefined;
    this.beacons.push(newBeacon);
    this.selectBeacon(newBeacon.fakeId!.toString());
    this.beaconsUpdated();
  }

  isActive() {
    return this.beaconClickService.getActiveTab() === 'beacons';
  }

  beaconsUpdated() {
    if (this.beacons.length > 0) {
      if (this.selectedBeacon) {
        this.beaconDropdown!.nativeElement.innerHTML =
          this.selectedBeacon!.beaconName!;
      } else {
        this.beaconDropdown!.nativeElement.innerHTML =
          this.beacons[0].beaconName!;
        this.selectedBeacon = this.beacons[0];
      }
      this.beaconsExist = true;
      this.dropdownDiv!.nativeElement.classList.remove('disabled');
      this.beaconDropdown!.nativeElement.classList.remove('disabled');
      this.beaconDropdown!.nativeElement.value =
        this.selectedBeacon!.networkDeviceId!;
    } else {
      this.beaconDropdown!.nativeElement.innerHTML = 'No Beacons Added';
      this.dropdownDiv!.nativeElement.classList.add('disabled');
      this.beaconDropdown!.nativeElement.classList.add('disabled');
      this.beaconsExist = false;
    }
    this.beaconClickService.updateBeacons(this.beacons);
  }

  selectBeacon(beaconFakeId: string) {
    this.beaconClickService.setActiveBeacon(beaconFakeId);
  }

  private _selectBeacon(beaconFakeId: string) {
    this.selectedBeacon = this.beacons.find(
      (b) => b.fakeId.toString() === beaconFakeId
    );
    this.beaconsUpdated();
  }

  constructor(
    private httpService: HttpService,
    private beaconClickService: MapService,
    private activeService: ActiveService
  ) {
    httpService.getNetworkDevices().then((devices) => {
      devices.subscribe((devices) => {
        this.networkDevices = devices;
      });
    });
  }

  setMap(map: ImageClickerComponent) {
    this.map = map;
    this.map?.beaconClick.subscribe((location: number[]) => {
      this.selectedBeacon!.locationX = location[0];
      this.selectedBeacon!.locationY = location[1];
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.beacons.length > 0) {
        this.selectBeacon(this.beacons[0].networkDeviceId!);
      }
      this.beaconsUpdated();
    }, 0);
    this.beaconClickService.latestClick.subscribe((location: number[]) => {
      if (this.selectedBeacon && this.isActive()) {
        this.selectedBeacon.locationX = location[0];
        this.selectedBeacon.locationY = location[1];
        this.beaconClickService.updateBeacons(this.beacons);
      }
    });
    this.beaconClickService.activeBeacon.subscribe((beaconFakeId: string) => {
      this._selectBeacon(beaconFakeId);
    });
    this.activeService.activeMap.subscribe((map: SiteMap) => {
      this.currMap = map;
      this.beacons = map.beacons;
      this.beaconsUpdated();
    });
  }

  ngOnInit(): void {}
}
