import { SectionSetupComponent } from './../section-setup/section-setup.component';
import { MapService } from './../services/beaconClickService';
import { ActiveService } from './../services/activeService';
import { Component, OnInit, Input } from '@angular/core';
import { SiteMap } from '../models/siteMap';
import { Section } from '../models/section';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { time } from 'console';
import { DialogConfirmComponent } from '../dialog-confirm/dialog-confirm.component';

@Component({
  selector: 'app-section-list',
  templateUrl: './section-list.component.html',
  styleUrls: ['./section-list.component.scss'],
})
export class SectionListComponent implements OnInit {
getColor(subsectionsLength: number): { [klass: string]: any; }|null|undefined {
  if (subsectionsLength == 0) {
    return { 'background-color': '#b6bbe691' };
  } else {
    return {};
  }
}
  addSection(sectionId: number | null) {
    let theSection = this.activeService.getSections.find(
      (section) => section.id === sectionId
    );
    const dialogRef = this.dialog.open(SectionSetupComponent, {
      data: { section: theSection, dialog: true },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        let sectionObject: Section = result.sectionObject;
        let sectionParent: Section = result.sectionParent;
        sectionObject.id = parseInt((new Date().getTime() / 1000).toString());
        if (sectionParent) {
          sectionParent.subsections.push(sectionObject);
        }
        this.activeService.pushToSections(sectionObject);
      }
    });
  }

  removeSection(sectionId: number | null) {
    let theSection = this.activeService.getSections.find(
      (section) => section.id === sectionId
    );
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        message:
          'Are you sure you want to remove this section?',
        icon: 'error',
        title: 'REMOVE SECTION' + theSection?.sectionName,
        color: 'red',
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        let theParent = this.activeService.getSections.find((section) =>
          section.subsections.includes(theSection!)
        );
        if (theParent) {
          let index = theParent.subsections.indexOf(theSection!);
          theParent.subsections.splice(index, 1);
        } else {
          let index = this.activeService.getSections.indexOf(theSection!);
          this.activeService.getSections.splice(index, 1);
        }
      }
    });
  }

  @Input() sections?: Section[] = [];
  @Input() depth: number = 0;
  selectedMap?: SiteMap = new SiteMap('0', 'Map', '123');

  constructor(
    private activeService: ActiveService,
    private beaconClickService: MapService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.activeService.activeMap.subscribe((map) => {
      if (
        map.mapImage != null ||
        map.mapImage != undefined ||
        map.mapImage != ''
      ) {
        this.selectedMap = map;
      }
    });
  }

  selectSection(id: number | null, openBeacons: boolean = false) {
    let clickedSection = this.activeService.getSections.find(
      (section) => section.id === id
    );
    let clickedMap = clickedSection?.innerMap;
    if (clickedMap) {
      this.activeService.setActiveSection(clickedSection!);
      this.activeService.setShowArea(true);
    }
    if (openBeacons) {
      this.beaconClickService.setActiveBeacon(
        this.beaconClickService.currentActiveBeacon
      );
      this.activeService.setShowBeacon(true);
    }
  }
}
