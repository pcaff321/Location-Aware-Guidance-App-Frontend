import { ProjectToSection } from './projectToSection';
import { Vertex } from './vertex';
import { Globals } from './../services/globals';
import { faTools } from '@fortawesome/free-solid-svg-icons';
import { SiteMap } from './siteMap';
import { Project } from './project';
import { Edge } from './edge';
import { Door } from './door';
import { Hint } from './hint';

export class Section {
  getProjectLocations(): {}[] {
    let projectLocations: {}[] = [];
    let projectsOfSection = this.projects || [];
    let projectToSections = ProjectToSection.cache.filter(
      (projectToSection) => projectToSection.section.fakeId == this.fakeId
    );
    for (let projectToSection of projectToSections) {
      if (projectsOfSection.includes(projectToSection.project)) {
        let projectLocation = {
          projectId: projectToSection.project.id,
          x: projectToSection.x,
          y: projectToSection.y,
        };
        if (!projectLocations.includes(projectLocation)) {
          projectLocations.push(projectLocation);
        }
      }
    }
    return projectLocations;
  }
  static sectionCache: Section[] = [];

  static findOjbectById(id: number): Section | undefined {
    return Section.sectionCache.find((section) => section.id == id);
  }

  static parseObject(result: any): any {
    let topLeft = [result['topLeftX'], result['topLeftY']];
    let bottomRight = [result['bottomRightX'], result['bottomRightY']];
    let innerMap =
      result['innerMapObject'] || SiteMap.parseObject(result['innerMap']);
    let newSection = Section.sectionCache.find(
      (section) => section.id == result['id']
    );
    if (newSection == null || newSection == undefined) {
      newSection = new Section(result['id'], innerMap, topLeft, bottomRight);
    }
    newSection.topLeft = topLeft;
    newSection.bottomRight = bottomRight;
    if (result['outerMap'] != null) {
      newSection.outerMap =
        result['outerMapObject'] || SiteMap.parseObject(result['outerMap']);
    }
    if (result['subsections'] != null) {
      for (let subsection of result['subsections']) {
        newSection.subsections.push(Section.parseObject(subsection));
      }
    }
    if (result['sectionName'] != null) {
      newSection.sectionName = result['sectionName'];
    }
    if (
      Section.sectionCache.find((section) => section.id == newSection!.id) ==
      null
    ) {
      Section.sectionCache.push(newSection);
    }
    return newSection;
  }

  _id: number | null = null;
  sectionName: string = '';
  outerMap?: SiteMap | null;
  innerMap: SiteMap | null;
  _topLeftX: number = 0;
  _topLeftY: number = 0;
  _bottomRightX: number = 10;
  _bottomRightY: number = 10;
  subsections: Section[] = [];
  fakeId: number = Globals.getFakeId();
  projects?: Project[];
  vertices?: Vertex[];
  edges?: Edge[];
  doors?: Door[];
  hints?: Hint[];

  get id(): number | null {
    return this._id;
  }

  set id(value: number | null) {
    if (value == null) {
      this._id = Globals.getFakeId() * -1;
    } else {
      this._id = value;
    }
  }

  addDoor(door: Door) {
    if (this.doors == null) {
      return;
    }
    if (!this.doors.includes(door)) {
      this.doors.push(door);
    }
  }

  get topLeftX(): number | null {
    return this._topLeftX;
  }

  set topLeftX(value: number | null) {
    let newValue = Math.round(value!);
    if (newValue > this.bottomRightX!) {
      return;
    }
    this._topLeftX = Math.round(value!);
  }

  get topLeftY(): number | null {
    return this._topLeftY;
  }

  set topLeftY(value: number | null) {
    let newValue = Math.round(value!);
    if (newValue > this.bottomRightY!) {
      return;
    }
    this._topLeftY = Math.round(value!);
  }

  get bottomRightX(): number | null {
    return this._bottomRightX;
  }

  set bottomRightX(value: number | null) {
    let newValue = Math.round(value!);
    if (newValue < this.topLeftX!) {
      return;
    }
    this._bottomRightX = Math.round(value!);
  }

  get bottomRightY(): number | null {
    return this._bottomRightY;
  }

  set bottomRightY(value: number | null) {
    let newValue = Math.round(value!);
    if (newValue < this.topLeftY!) {
      return;
    }
    this._bottomRightY = Math.round(value!);
  }

  constructor(
    sectionId: number | null,
    innerMap: SiteMap | null,
    topLeft: number[],
    bottomRight: number[]
  ) {
    this.id = sectionId;
    this.sectionName = 'Section ' + sectionId;
    this.innerMap = innerMap;
    this.topLeft = topLeft;
    this.bottomRight = bottomRight;
  }

  set topLeft(topLeft: number[]) {
    this.topLeftX = topLeft[0];
    this.topLeftY = topLeft[1];
  }

  set bottomRight(bottomRight: number[]) {
    this.bottomRightX = bottomRight[0];
    this.bottomRightY = bottomRight[1];
  }

  toJson() {
    let sectionJson = {
      id: this.id,
      sectionName: this.sectionName,
      outerMap: this.outerMap,
      innerMap: this.innerMap,
      topLeftX: this.topLeftX,
      topLeftY: this.topLeftY,
      bottomRightX: this.bottomRightX,
      bottomRightY: this.bottomRightY,
      subsections: this.subsections,
      fakeId: this.fakeId,
    };
    return sectionJson;
  }
}
