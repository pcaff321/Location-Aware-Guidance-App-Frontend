import { HttpService } from './../services/httpService';
import { Door } from './../models/door';
import { Vertex } from './../models/vertex';
import { Globals } from './../services/globals';
import { SiteMap } from './../models/siteMap';
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { Section } from '../models/section';
import { MapService } from '../services/beaconClickService';
import { ActiveService } from '../services/activeService';
import {
  faArrowLeft,
  faArrowRight,
  faArrowUp,
  faArrowDown,
} from '@fortawesome/free-solid-svg-icons';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-room-setup',
  templateUrl: './room-setup.component.html',
  styleUrls: ['./room-setup.component.scss'],
})
export class RoomSetupComponent implements OnInit, AfterViewInit {
  removeDoor(doorId: number) {
    this.updateDoorType(doorId, 0);
    if (this.selectedSubsection == null || this.selectedSubsection == undefined || this.selectedSubsection.doors == null || this.selectedSubsection.doors == undefined) {
      this.doors = [];
      return;
    }
    this.selectedSubsection!.doors = this.selectedSubsection!.doors.filter(
      (door) => door.fakeId != doorId
    );
    this.doors = this.selectedSubsection!.doors.filter((door) => door.isDoor());
  }

  addDoor: boolean = false;

  updateDoorType(doorId: number, doorType: number) {
    var relevantDoor = this.doors.find((door) => door.id == doorId);
    if (relevantDoor) {
      relevantDoor.doorType = doorType;
    }
  }

  adjustSize: boolean = false;

  doors: Door[] = [];

  public toggleSize(event: MatSlideToggleChange) {
    this.adjustSize = event.checked;
  }

  faArrowLeft = faArrowLeft;
  faArrowRight = faArrowRight;
  faArrowUp = faArrowUp;
  faArrowDown = faArrowDown;

  mouseDownInterval = 300;
  mouseDownLeft = false;
  mouseDownRight = false;
  mouseDownUp = false;
  mouseDownDown = false;

  debounce = false;

  moveLeftWithDebounce() {
    if (this.mouseDownLeft && !this.debounce) {
      this.selectedSubsection!.topLeftX! -= 1;
      this.selectedSubsection!.bottomRightX! -= 1;
      this.areasUpdated();
      setInterval(() => {
        this.debounce = false;
        this.moveLeftWithDebounce();
      }, this.mouseDownInterval);
    }
  }

  moveRightWithDebounce() {
    if (this.mouseDownRight && !this.debounce) {
      this.selectedSubsection!.topLeftX! += 1;
      this.selectedSubsection!.bottomRightX! += 1;
      this.areasUpdated();
      setInterval(() => {
        this.debounce = false;
        this.moveRightWithDebounce();
      }, this.mouseDownInterval);
    }
  }

  moveUpWithDebounce() {
    if (this.mouseDownUp && !this.debounce) {
      this.selectedSubsection!.topLeftY! -= 1;
      this.selectedSubsection!.bottomRightY! -= 1;
      this.areasUpdated();
      setInterval(() => {
        this.debounce = false;
        this.moveUpWithDebounce();
      }, this.mouseDownInterval);
    }
  }

  moveDownWithDebounce() {
    if (this.mouseDownDown && !this.debounce) {
      this.selectedSubsection!.topLeftY! += 1;
      this.selectedSubsection!.bottomRightY! += 1;
      this.areasUpdated();
      setInterval(() => {
        this.debounce = false;
        this.moveDownWithDebounce();
      }, this.mouseDownInterval);
    }
  }

  mouseDownLeftEvent() {
    this.mouseDownLeft = true;
    this.moveLeftWithDebounce();
  }

  mouseDownRightEvent() {
    this.mouseDownRight = true;
    this.moveRightWithDebounce();
  }

  mouseDownUpEvent() {
    this.mouseDownUp = true;
    this.moveUpWithDebounce();
  }

  mouseDownDownEvent() {
    this.mouseDownDown = true;
    this.moveDownWithDebounce();
  }

  mouseUpLeftEvent() {
    this.mouseDownLeft = false;
  }

  mouseUpRightEvent() {
    this.mouseDownRight = false;
  }

  mouseUpUpEvent() {
    this.mouseDownUp = false;
  }

  mouseUpDownEvent() {
    this.mouseDownDown = false;
  }

  updateTopLeftY($event: Event) {
    let newValue = Number(($event.target as HTMLInputElement).value);
    if (!this.adjustSize) {
      let oldValue = this.selectedSubsection!.topLeftY || 0;
      this.selectedSubsection!.bottomRightY! += newValue - oldValue;
    }
    this.selectedSubsection!.topLeftY = newValue;
    this.areasUpdated();
  }

  updateTopLeftX($event: Event) {
    let newValue = Number(($event.target as HTMLInputElement).value);
    if (!this.adjustSize) {
      let oldValue = this.selectedSubsection!.topLeftX || 0;
      this.selectedSubsection!.bottomRightX! += newValue - oldValue;
    }
    this.selectedSubsection!.topLeftX = newValue;
    this.areasUpdated();
  }

  updateBottomRightY($event: Event) {
    let newValue = Number(($event.target as HTMLInputElement).value);
    let oldValue = this.selectedSubsection!.bottomRightY || 0;
    if (!this.adjustSize) {
      this.selectedSubsection!.topLeftY! += newValue - oldValue;
    }
    this.selectedSubsection!.bottomRightY = newValue;
    this.areasUpdated();
  }

  updateBottomRightX($event: Event) {
    let newValue = Number(($event.target as HTMLInputElement).value);
    if (!this.adjustSize) {
      let oldValue = this.selectedSubsection!.bottomRightX || 0;
      this.selectedSubsection!.topLeftX! += newValue - oldValue;
    }
    this.selectedSubsection!.bottomRightX = newValue;
    this.areasUpdated();
  }

  selectedSubsection: Section | undefined;

  selectArea(id: number) {
    let newSelectedSection = this.areas.find(
      (section) => section.fakeId === id
    );
    this.activeService.setActiveSubsection(newSelectedSection!);
  }

  areasExist: boolean = false;
  areas: Section[] = [];

  activeSection?: Section;
  activeVertex?: Vertex;

  @ViewChild('areasDropdown') sectionsDropdown: ElementRef | undefined;

  constructor(
    private activeService: ActiveService,
    private beaconClickService: MapService,
    private httpService: HttpService
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.activeService.activeSection.subscribe((section) => {
      this.activeSection = section;
      this.areas = section?.subsections || [];
      this.areasUpdated();
    });
    this.activeService.activeSubsection.subscribe((subsection) => {
      this.selectedSubsection = subsection;
      this.httpService.getDoorsOfSection(subsection).pipe().subscribe((doors) => {
        this.doors = doors.filter((door) => door.isDoor());
      });
      this.areasUpdated();
    });
    this.beaconClickService.activeTabObservable.subscribe((tab) => {
      if (tab === Globals.overviewViewTab) {
        this.areasUpdated();
      }
    });
    this.activeService.clickedSectionObservable.subscribe((section) => {
      if (this.areas.find((area) => area.id === section.id)) {
        this.activeService.setActiveSubsection(section);
      }
    });
    this.activeService.activeVertex.subscribe((vertexFakeId) => {
      var doorToAdd = this.activeSection?.vertices?.find(
        (element) => element.fakeId === vertexFakeId
      );
      if (doorToAdd && this.isActive()) {
        this.activeVertex = doorToAdd;
        if (!this.doors.find((element) => element.vertex.fakeId === vertexFakeId) && this.selectedSubsection && this.addDoor) {
          var newDoor = new Door(0, doorToAdd, this.selectedSubsection!);
          newDoor.doorType = 1;
          this.selectedSubsection!.addDoor(newDoor);
          this.doors = this.selectedSubsection!.doors!.filter((door) => door.isDoor());
        }
      }
    });
  }

  isActive() {
    return this.beaconClickService.getActiveTab() === 'rooms';
  }

  areasUpdated() {
    if (this.areas.length > 0) {
      if (this.selectedSubsection) {
        this.sectionsDropdown!.nativeElement.innerHTML = 'sectionName [mapName]'
          .replace('sectionName', this.selectedSubsection!.sectionName!)
          .replace('mapName', this.selectedSubsection!.innerMap?.mapName!);
      } else {
        this.sectionsDropdown!.nativeElement.innerHTML = 'sectionName [mapName]'
          .replace('sectionName', this.areas[0].sectionName!)
          .replace('mapName', this.areas[0].innerMap?.mapName!);
        this.selectedSubsection = this.areas[0];
        this.httpService.getDoorsOfSection(this.areas[0]).pipe().subscribe((doors) => {
          this.doors = doors.filter((door) => door.isDoor());
        }
        );
      }
      this.areasExist = true;
    } else {
      this.sectionsDropdown!.nativeElement.innerHTML = 'No Areas Added';
      this.areasExist = false;
    }
    this.activeService.setActiveSubsections(this.areas);
  }
}
