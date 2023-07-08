import { HttpService } from './../services/httpService';
import { Site } from './../models/site';
import { MatDialog } from '@angular/material/dialog';
import { MapService } from './../services/beaconClickService';
import { ActiveService } from './../services/activeService';
import { Globals } from './../services/globals';
import { Component, Input, OnInit } from '@angular/core';
import { Section } from '../models/section';
import { SiteMap } from '../models/siteMap';
import { SectionSetupComponent } from '../section-setup/section-setup.component';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-overview-setup',
  templateUrl: './overview-setup.component.html',
  styleUrls: ['./overview-setup.component.scss'],
})
export class OverviewSetupComponent implements OnInit {
  testMode: boolean = false;
  @Input() sectionsA?: Section[];
  listOf1to100: any;
  selectedMap?: SiteMap = new SiteMap('0', 'Map', '123');

  sections?: [{ section: Section; subsections: any }];

  site?: Site;

  addSection(sectionId: number | null) {
    let theSection = undefined;
    if (sectionId != null) {
      this.activeService.getSections.find(
        (section) => section.id === sectionId
      );
    }
    const dialogRef = this.dialog.open(SectionSetupComponent, {
      data: { section: theSection, dialog: true },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.sectionObject) {
        // this.httpService.submitForm(section, 'sections/').subscribe();
        let newSection = result.sectionObject;
        this.site!.startSection = newSection;
        this.activeService.setSite(this.site!);
        let oneTree = this.makeSectionsOneList(newSection);
        this.activeService.setSections = oneTree;
      }
    });
  }

  startSection?: Section;
  mapSubscription?: Subscription;

  makeRandomSections = (
    numSections: number,
    numSubsections: number,
    numSubsubsections: number
  ) => {
    const sections: any = [];
    for (let i = 0; i < numSections; i++) {
      let sectionMap: any = {
        section: new Section(
          this.listOf1to100.pop(),
          this.makeRandomMap(),
          this.makeRandomPoint(),
          this.makeRandomPoint()
        ),
        subsections: [],
      };
      let maps = this.activeService.getMaps;
      maps.push(sectionMap.section.innerMap);
      for (let j = 0; j < numSubsections; j++) {
        let subsectionMap: any = {
          subsection: new Section(
            this.listOf1to100.pop(),
            this.makeRandomMap(),
            this.makeRandomPoint(),
            this.makeRandomPoint()
          ),
          subsubsections: [],
        };
        this.activeService.pushToMaps(subsectionMap.subsection.innerMap);
        subsectionMap.subsection.outerMap = sectionMap.section.innerMap;
        for (let k = 0; k < numSubsubsections; k++) {
          subsectionMap.subsubsections.push(
            new Section(
              this.listOf1to100.pop(),
              this.makeRandomMap(),
              this.makeRandomPoint(),
              this.makeRandomPoint()
            )
          );
          this.activeService.pushToMaps(
            subsectionMap.subsubsections[k].innerMap
          );
        }
        sectionMap.subsections.push(subsectionMap);
      }
      sections.push(sectionMap);
    }
    return sections;
  };

  makeRandomSectionTree(
    section: Section,
    depth: number,
    numSubsections: number
  ): Section {
    if (depth <= 0) {
      let newSection = new Section(
        this.listOf1to100.pop(),
        this.makeRandomMap(),
        this.makeRandomPoint(),
        this.makeRandomPoint()
      );
      newSection.outerMap = section.innerMap;
      this.activeService.pushToMaps(newSection.innerMap!);
      return newSection;
    } else if (depth >= 4) {
      depth = 4;
    }
    for (let i = 0; i < numSubsections; i++) {
      let map = this.makeRandomMap();
      this.activeService.pushToMaps(map);
      let subsection = this.makeRandomSectionTree(
        new Section(
          this.listOf1to100.pop(),
          map,
          this.makeRandomPoint(),
          this.makeRandomPoint()
        ),
        depth - 1,
        numSubsections
      );
      subsection.outerMap = section.innerMap;
      section.subsections.push(subsection);
    }
    return section;
  }

  makeRandomMap = () => {
    let ranNum = this.listOf1to100.pop();
    let newMap = new SiteMap(
      ranNum.toString(),
      'Room ' + ranNum.toString(),
      Math.random().toString()
    );
    newMap.contentType = Globals.testMapImage.contentType;
    newMap.mapImage = Globals.testMapImage.image;
    return newMap;
  };

  makeRandomPoint = () => {
    return [Math.random() * 100, Math.random() * 100];
  };

  countDepthOfTree = (section: Section, depth: number): number => {
    if (section.subsections.length === 0) {
      return depth;
    } else {
      let maxDepth = 0;
      for (let i = 0; i < section.subsections.length; i++) {
        let newDepth = this.countDepthOfTree(section.subsections[i], depth + 1);
        if (newDepth > maxDepth) {
          maxDepth = newDepth;
        }
      }
      return maxDepth;
    }
  };

  constructor(
    private activeService: ActiveService,
    private beaconClickService: MapService,
    private dialog: MatDialog,
    private httpService: HttpService
  ) {}

  displayTree() {
    if (Globals.testMode) {
      this.generateSections();
    } else {
      this.sectionsA = [this.startSection!]; // tree
      let sectionsOneList = this.makeSectionsOneList(this.startSection!);
      this.activeService.setSections = sectionsOneList;
      this.activeService.setActiveSection(this.startSection!);
      if (this.startSection!.id! > 0) {
        this.httpService
          .getSectionsBySiteId(this.site!.id!)
          .then((sections) => {
            let subscription = sections.subscribe(async (sections) => {
              let theSections = await sections;
              theSections = this.makeSectionsOneList(theSections[0]);
              this.activeService.setSections = theSections;
              let theStart = theSections.find(
                (section) => section.id === this.site!.startSection!.id
              );
              this.activeService.setActiveSection(theStart!);
              subscription.unsubscribe();
            });
          });
      }
    }
  }

  updateMapPointsOfSections(sections: Section[]) {
    let maps: SiteMap[] = [];
    sections.forEach((section) => {
      if (section.id == null || section.id < 1) return;
      maps.push(section.innerMap!);
      this.httpService.updateMapPointsBySectionId(section.id!.toString(), maps);
    });

    this.httpService.updateProjectLocations(sections);
    //this.httpService.updateMapPoints(maps);
  }

  ngOnInit(): void {
    this.activeService.activeSite.subscribe((site) => {
      this.site = site;
      this.startSection = site.startSection!;
      if (this.startSection) {
        this.displayTree();
      }
    });

    this.activeService.currentActiveSections.subscribe((sections) => {
      this.updateMapPointsOfSections(sections);
    });
  }

  makeSectionsOneList(tree: Section) {
    let sections: Section[] = [];
    sections.push(tree);
    for (let i = 0; i < tree.subsections.length; i++) {
      sections = sections.concat(this.makeSectionsOneList(tree.subsections[i]));
    }
    return sections;
  }

  generateSections() {
    this.listOf1to100 = Array.from(Array(100).keys());
    for (let i = this.listOf1to100.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.listOf1to100[i], this.listOf1to100[j]] = [
        this.listOf1to100[j],
        this.listOf1to100[i],
      ];
    }
    let startSection = this.startSection;
    this.activeService.pushToMaps(startSection!.innerMap!);
    let tree = this.makeRandomSectionTree(startSection!, 3, 2);
    this.sectionsA = [tree];
    let sectionsOneList = this.makeSectionsOneList(tree);
    this.activeService.setSections = sectionsOneList;
    this.activeService.setActiveSection(startSection!);
    this.activeService.activeMap.subscribe((map) => {
      if (
        map.mapImage != null ||
        map.mapImage != undefined ||
        map.mapImage != ''
      ) {
        this.selectedMap = map;
      } else {
        this.selectedMap = startSection!.innerMap || undefined;
      }
    });
  }
}
