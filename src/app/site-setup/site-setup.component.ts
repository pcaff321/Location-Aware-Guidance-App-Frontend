import { SiteMap } from './../models/siteMap';
import { ActiveService } from './../services/activeService';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { MapService } from '../services/beaconClickService';
import { Section } from '../models/section';
import { Door } from '../models/door';
import { HttpService } from '../services/httpService';
import { skip } from 'rxjs';

@Component({
  selector: 'app-site-setup',
  templateUrl: './site-setup.component.html',
  styleUrls: ['./site-setup.component.scss'],
})
export class SiteSetupComponent implements OnInit, AfterViewInit {
  removeDoor(exitId: number) {
    this.updateDoorType(exitId, 0);
    if (this.activeSection == null || this.activeSection == undefined || this.activeSection.doors == null || this.activeSection.doors == undefined) {
      this.doors = [];
      return;
    }
    this.activeSection!.doors = this.activeSection!.doors.filter(
      (door) => door.fakeId != exitId
    );
    this.doors = this.activeSection!.doors.filter((door) => door.isExit());
  }

  addExit: boolean = false;

  updateDoorType(doorId: number, doorType: number) {
    var relevantDoor = this.doors.find((exit) => exit.id == doorId);
    if (relevantDoor) {
      relevantDoor.doorType = doorType;
    }
  }




  updateSectionName(name: string) {
    this.activeSection!.sectionName = name;
    this.activeService.setActiveSection(this.activeSection!);
  }
  activeLocation = true;

  activeSection?: Section;

  updateLength(arg0: string) {
    this.map!.metresBetweenPoints = parseFloat(arg0);
    this.activeService.setActiveMap(this.map!);
  }
  updateSecondPointY(arg0: string) {
    this.map!.sizingLocation2Y = parseInt(arg0);
    this.activeService.setActiveMap(this.map!);
  }

  updateSecondPointX(arg0: string) {
    this.map!.sizingLocation2X = parseInt(arg0);
    this.activeService.setActiveMap(this.map!);
  }

  updateFirstPointY(arg0: string) {
    this.map!.sizingLocation1Y = parseInt(arg0);
    this.activeService.setActiveMap(this.map!);
  }

  updateFirstPointX(arg0: string) {
    this.map!.sizingLocation1X = parseInt(arg0);
    this.activeService.setActiveMap(this.map!);
  }

  map?: SiteMap;
  locationX: number = 0;
  locationY: number = 0;

  doors: Door[] = [];

  constructor(
    private beaconClickService: MapService,
    private activeService: ActiveService,
    private httpService: HttpService
  ) {
    this.activeService.activeMap.subscribe((map: SiteMap) => {
      this.map = map;
    });
  }

  ngAfterViewInit(): void {
    this.beaconClickService.latestClick.subscribe((pos: number[]) => {
      if (this.activeLocation && this.isActive()) {
        this.map!.sizingLocation1X = pos[0];
        this.map!.sizingLocation1Y = pos[1];
        this.activeService.setActiveMap(this.map!);
      }
    });

    this.beaconClickService.latestRightClick.subscribe((pos: number[]) => {
      if (this.activeLocation && this.isActive()) {
        this.map!.sizingLocation2X = pos[0];
        this.map!.sizingLocation2Y = pos[1];
        this.activeService.setActiveMap(this.map!);
      }
    });

    this.activeService.activeSection.subscribe((section: Section) => {
      this.activeSection = section;
      this.httpService.getDoorsOfSection(section).pipe().subscribe((doors) => {
        this.doors = doors.filter((door) => door.isExit());
      });
    });

    this.activeService.activeVertex.subscribe((vertexFakeId) => {
      var doorToAdd = this.activeSection?.vertices?.find(
        (element) => element.fakeId === vertexFakeId
      );
      if (doorToAdd && this.isActive()) {
        if (!this.doors.find((element) => element.vertex.fakeId === vertexFakeId) && this.activeSection && this.addExit) {
          var newDoor = new Door(0, doorToAdd, this.activeSection!);
          newDoor.doorType = 2;
          this.activeSection.addDoor(newDoor);
          this.doors = this.activeSection.doors!.filter((door) => door.isExit());
        }
      }
    });
  }

  isActive() {
    return this.beaconClickService.getActiveTab() === 'info';
  }

  ngOnInit(): void {}
}
