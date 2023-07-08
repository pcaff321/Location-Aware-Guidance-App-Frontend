import { Globals } from './globals';
import { Beacon } from './../models/beacon';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SiteMap } from '../models/siteMap';

@Injectable()
export class MapService {
  activeTab: string = '';


  getActiveTab() {
    return this.activeTab;
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.setActiveTabSource(tab);
  }

  private activeTabSource = new BehaviorSubject<string>(Globals.overviewViewTab);
  activeTabObservable = this.activeTabSource.asObservable();

  setActiveTabSource(tab: string) {
    this.activeTabSource.next(tab);
  }


  setActiveBeacon(beaconFakeId: string) {
    this.activeBeaconSource.next(beaconFakeId);
    this.currentActiveBeacon = beaconFakeId;
  }
  updateBeacons(beacons: import("../models/beacon").Beacon[]) {
    this.beaconUpdateSource.next(beacons);
  }

  private updateClickMapSource = new BehaviorSubject<boolean>(false);
  updateClickMapObservable = this.updateClickMapSource.asObservable();

  updateClickMap() {
    this.updateClickMapSource.next(true);
  }

  public currentActiveBeacon: string = '';

  private mapClickSource = new BehaviorSubject([0,0]);
  latestClick = this.mapClickSource.asObservable();

  private rightClickSource = new BehaviorSubject([0,0]);
  latestRightClick = this.rightClickSource.asObservable();

  private activeBeaconSource = new BehaviorSubject<string>('NO BEACON SELECTED');
  activeBeacon = this.activeBeaconSource.asObservable();

  private beaconUpdateSource = new BehaviorSubject<Beacon[]>([]);
  currentBeacons = this.beaconUpdateSource.asObservable();

  
  private mapBeacons = new Map<string, Beacon[]>();
  private mapBeaconsSource = new BehaviorSubject<Map<string, Beacon[]>>(this.mapBeacons);
  currentMapBeacons = this.mapBeaconsSource.asObservable();

  setMapBeacons(mapId: string, beacons: Beacon[]) {
    this.mapBeacons.set(mapId, beacons);
    this.mapBeaconsSource.next(this.mapBeacons);
  }

  setNewMapBeacons(mapBeacons: Map<string, Beacon[]>) {
    this.mapBeacons = mapBeacons;
    this.mapBeaconsSource.next(this.mapBeacons);
  }

  getMapBeacons() {
    return this.mapBeacons;
  }

  constructor() { }

  updateLeftClick(message: number[]) {
    this.mapClickSource.next(message);
  }

  updateRightClick(message: number[]) {
    this.rightClickSource.next(message);
  }

}
