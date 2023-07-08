import { ActiveService } from './../services/activeService';
import { HttpClient } from '@angular/common/http';
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Inject,
  AfterViewInit,
  AfterContentInit,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SiteMap } from '../models/siteMap';
import { HttpService } from '../services/httpService';
import { Section } from '../models/section';

@Component({
  selector: 'app-section-setup',
  templateUrl: './section-setup.component.html',
  styleUrls: ['./section-setup.component.scss'],
})
export class SectionSetupComponent
  implements OnInit, AfterViewInit, AfterContentInit
{
  id?: number;
  name?: string;
  outerMap?: SiteMap;
  innerMap?: SiteMap;
  topLeft?: number;
  bottomRight?: number;

  outerMaps: SiteMap[] = [];
  innerMaps: SiteMap[] = [];
  allMaps: SiteMap[] = [];

  @ViewChild('sectionName') sectionNameElem: ElementRef | undefined;
  @ViewChild('sectionTopLeft') sectionTopLeftElem: ElementRef | undefined;
  @ViewChild('sectionBottomRight') sectionBottomRightElem:
    | ElementRef
    | undefined;
  @ViewChild('sectionOuterMap') sectionOuterMapElem: ElementRef | undefined;
  @ViewChild('sectionInnerMap') sectionInnerMapElem: ElementRef | undefined;

  updateSectionName($event: Event) {
    this.name = ($event.target as HTMLInputElement).value;
  }

  updateSectionTopLeft($event: Event) {
    this.topLeft = parseInt(($event.target as HTMLInputElement).value);
  }

  updateSectionBottomRight($event: Event) {
    this.bottomRight = parseInt(($event.target as HTMLInputElement).value);
  }

  updateSectionOuterMap($event: Event) {
    this.outerMap = this.allMaps.find(
      (map) => map.mapId == ($event.target as HTMLInputElement).value
    );
    this.innerMaps = this.allMaps.filter(
      (map) => map.mapId != this.outerMap?.mapId
    );
  }

  updateSectionInnerMap($event: Event) {
    this.innerMap = this.allMaps.find(
      (map) => map.mapId == ($event.target as HTMLInputElement).value
    );
    this.outerMaps = this.allMaps.filter(
      (map) => map.mapId != this.innerMap?.mapId
    );
  }

  constructor(
    private httpService: HttpService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<SectionSetupComponent>,
    private activeService: ActiveService
  ) {}

  ngOnInit(): void {
    this.httpService.getMaps().then((maps) => {
      maps.subscribe((maps) => {
        this.allMaps = this.activeService.maps;
        this.outerMaps = this.activeService.takenMaps;
        this.innerMaps = this.activeService.availableMaps;

        this.sectionInnerMapElem!.nativeElement.value = this.innerMap?.mapId;
        this.sectionOuterMapElem!.nativeElement.value = this.outerMap?.mapId;
      });
    });
  }

  ngAfterViewInit() {
    if (this.data.sectionId) {
      this.httpService.getSection(this.data.sectionId).then((section) => {
        section.subscribe((section: any) => {
          this.id = section.id;
          this.name = section.name;
          this.outerMap = section.outerMap;
          this.innerMap = section.innerMap;
          this.topLeft = section.topLeft;
          this.bottomRight = section.bottomRight;
        });
      });
    }
    if (this.data.section && this.data.section.innerMap) {
      let outerMapId = this.data.section.innerMap?.mapId;
      let outerMap = this.activeService.maps.find(
        (map) => map.mapId == outerMapId
      );
      if (!outerMap && outerMapId && outerMapId != '0') {
        let retrievedMap = this.httpService
          .getSiteMap(outerMapId)
          .then((map) => {
            map.subscribe((map) => {
              return map;
            });
          });
        outerMap = SiteMap.parseObject(retrievedMap);
      }
      if (outerMap) {
        this.outerMap = outerMap;
        this.sectionOuterMapElem!.nativeElement.value = outerMapId;
        this.sectionOuterMapElem!.nativeElement.disabled = true;
      }
    }
    setTimeout(() => {
      if (this.sectionNameElem) {
        this.sectionNameElem.nativeElement.value = this.name;
      }
      if (this.sectionTopLeftElem) {
        this.sectionTopLeftElem.nativeElement.value = this.topLeft;
      }
      if (this.sectionBottomRightElem) {
        this.sectionBottomRightElem.nativeElement.value = this.bottomRight;
      }
      if (this.sectionInnerMapElem) {
        this.sectionInnerMapElem.nativeElement.value = this.innerMap?.mapId;
      }
      if (this.sectionOuterMapElem) {
        this.sectionOuterMapElem.nativeElement.value = this.outerMap?.mapId;
      }
    }, 300);
  }

  ngAfterContentInit() {
    setTimeout(() => {
      if (this.sectionNameElem) {
        this.sectionNameElem.nativeElement.value = this.name;
      }
      if (this.sectionTopLeftElem) {
        this.sectionTopLeftElem.nativeElement.value = this.topLeft;
      }
      if (this.sectionBottomRightElem) {
        this.sectionBottomRightElem.nativeElement.value = this.bottomRight;
      }
      if (this.sectionInnerMapElem) {
        this.sectionInnerMapElem.nativeElement.value = this.innerMap?.mapId;
      }
      if (this.sectionOuterMapElem) {
        this.sectionOuterMapElem.nativeElement.value = this.outerMap?.mapId;
      }
    }, 1500);
  }

  validateForm() {
    if (this.name == null || this.name == '') {
      alert('Please enter a name for the section.');
      return false;
    }
    if (this.innerMap == null) {
      alert('Please select an inner map.');
      return false;
    }
    return true;
  }

  submitForm($event: Event) {
    $event.preventDefault();
    if (this.validateForm() == false) {
      return false;
    }
    let section = {
      id: this.id,
      name: this.name,
      sectionName: this.name,
      outerMapObject: this.outerMap,
      innerMapObject: this.innerMap,
      outerMapId: this.outerMap?.mapId,
      innerMapId: this.innerMap?.mapId,
      topLeftX: 0,
      topLeftY: 0,
      bottomRightX: 50,
      bottomRightY: 50,
    };
    if (this.data == null || !this.data.dialog) {
      //this.httpService.submitForm(section, 'sections/').subscribe();
    } else {
      let sectionObject: Section = Section.parseObject(section);
      this.dialogRef.close({
        sectionObject: sectionObject,
        sectionParent: this.data.section,
        sectionRaw: section
      });
    }

    return false;
  }
}
