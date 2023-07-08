import { Vertex } from './../models/vertex';
import { HttpClient } from '@angular/common/http';
import { Globals } from './globals';
import { Section } from './../models/section';
import { SiteMap } from '../models/siteMap';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, of } from 'rxjs';
import { Site } from '../models/site';
import { Hint } from '../models/hint';
import { Project } from '../models/project';
import { Edge } from '../models/edge';

@Injectable()
export class ActiveService {

  updateMaps() {
    this.getMapsCall().then((maps) => {
      maps.subscribe((maps) => {
        this.setMaps = maps;
      }
      );
    });
  }


  async getMapsCall() {
    return this.http.get<String>(this.baseUrl + 'maps/').pipe(
      map((result: any) => {
        let maps = [];
        for (let map of result) {
          maps.push(SiteMap.parseObject(map));
        }
        return maps;
      }),
      catchError((error) => {
        console.error(error);
        return of([]);
      })
    );
  }

  updateVertices(vertices: Vertex[]){
    this.setVertices = vertices;
  }

  private verticesSource = new BehaviorSubject<Vertex[]>([]);
  currentVertices = this.verticesSource.asObservable();

  set setVertices(vertices: Vertex[]) {
    this.verticesSource.next(vertices);
  }

  private projectClickedObservable = new BehaviorSubject<Project | undefined>(undefined);
  projectClicked = this.projectClickedObservable.asObservable();

  setProjectClicked(project: Project | undefined) {
    this.projectClickedObservable.next(project);
  }

  private activeClickedEdgeSource = new BehaviorSubject<Vertex[] | null>(null);

  activeClickedEdge = this.activeClickedEdgeSource.asObservable();

  setActiveClickedEdge(edge: Vertex[] | null) {
    this.activeClickedEdgeSource.next(edge);
  }

  private showRelatedToActiveVertexSource = new BehaviorSubject<boolean>(false);
  showRelatedToActiveVertexObservable = this.showRelatedToActiveVertexSource.asObservable();

  showRelatedToActiveVertex(show: boolean) {
    this.showRelatedToActiveVertexSource.next(show);
  }

  private showConnectionsSource = new BehaviorSubject<boolean>(true);
  showConnections = this.showConnectionsSource.asObservable();

  setShowConnections(show: boolean) {
    this.showConnectionsSource.next(show);
  }

  private activeProjectSource = new BehaviorSubject<Project | undefined>(undefined);
  activeProjectObservable = this.activeProjectSource.asObservable();
  activeProject?: Project = undefined;

  updateActiveProject(project: Project | undefined) {
    this.activeProjectSource.next(project);
    this.activeProject = project;
  }

  clickedSection(clickedSection: Section) {
    this.clickedSectionSource.next(clickedSection);
  }
  private clickedSectionSource = new BehaviorSubject<Section>(
    new Section(null, null, [0, 1], [0, 1])
  );
  clickedSectionObservable = this.clickedSectionSource.asObservable();

  maps: SiteMap[] = [];

  get getMaps() {
    return this.maps;
  }

  set setMaps(maps: SiteMap[]) {
    this.maps = maps;
    this.updateAvailableMaps();
  }

  pushToMaps(map: SiteMap) {
    this.maps.push(map);
  }

  setActiveMap(map: SiteMap) {
    this.activeMapSource.next(map);
  }

  private activeVertexSource = new BehaviorSubject<number>(0);
  activeVertex = this.activeVertexSource.asObservable();

  setActiveVertex(vertexFakeId: number) {
    this.activeVertexSource.next(vertexFakeId);
  }

  private rightClickedVertexSource = new BehaviorSubject<number>(0);
  rightClickedVertex = this.rightClickedVertexSource.asObservable();

  setRightClickedVertex(vertexFakeId: number) {
    this.rightClickedVertexSource.next(vertexFakeId);
  }

  private activeHintSource = new BehaviorSubject<Hint | null>(null);
  activeHint = this.activeHintSource.asObservable();

  setActiveHint(hint: Hint) {
    this.activeHintSource.next(hint);
  }


  public currentActiveBeacon: string = '';

  private activeMapSource = new BehaviorSubject<SiteMap>(
    new SiteMap(null, null, null)
  );
  activeMap = this.activeMapSource.asObservable();

  availableMaps : SiteMap[] = [];

  get getAvailableMaps() {
    return this.availableMaps;
  }

  set setAvailableMaps(maps: SiteMap[]) {
    this.availableMaps = maps;
  }

  takenMaps : SiteMap[] = [];

  get getTakenMaps() {
    return this.takenMaps;
  }

  set setTakenMaps(maps: SiteMap[]) {
    this.takenMaps = maps;
  }

  sections: Section[] = [];

  get getSections() {
    return this.sections;
  }

  set setSections(sections: Section[]) {
    this.setActiveSections(sections);
  }

  updateAvailableMaps() {
    let takenMapIds : string[] = [];
    for (let i = 0; i < this.sections.length; i++) {
      takenMapIds.push(this.sections[i].innerMap!.mapId as string);
    }
    this.availableMaps = [];
    this.takenMaps = [];

    for (let i = 0; i < this.maps.length; i++) {
      if (takenMapIds.includes(this.maps[i].mapId as string)) {
        this.takenMaps.push(this.maps[i]);
      } else {
        this.availableMaps.push(this.maps[i]);
      }
    }
  }

  pushToSections(section: Section) {
    this.sections.push(section);
    this.setSections = this.sections;
  }

  private activeSectionsSource = new BehaviorSubject<Section[]>([]);
  currentActiveSections = this.activeSectionsSource.asObservable();

  setActiveSections(sections: Section[]) {
    this.sections = sections;
    this.updateAvailableMaps();
    this.activeSectionsSource.next(sections);
  }

  private activeSectionSource = new BehaviorSubject<Section>(
    new Section(null, null, [0, 1], [0, 1])
  );
  activeSection = this.activeSectionSource.asObservable();

  setActiveSection(section: Section) {
    this.activeSectionSource.next(section);
    this.setActiveMap(section.innerMap!);
    if (section.subsections && section.subsections.length > 0) {
      this.setActiveSubsection(section.subsections![0]);
    }
  }

  private activeSiteSource = new BehaviorSubject<Site>(new Site(null, null));
  activeSite = this.activeSiteSource.asObservable();

  setSite(site: Site) {
    this.activeSiteSource.next(site);
  }

  private activeSubsectionsSource = new BehaviorSubject<Section[]>([]);
  currentActiveSubsections = this.activeSubsectionsSource.asObservable();

  setActiveSubsections(sections: Section[]) {
    this.activeSubsectionsSource.next(sections);
  }

  private activeSubsectionSource = new BehaviorSubject<Section>(
    new Section(null, null, [0, 1], [0, 1])
  );
  activeSubsection = this.activeSubsectionSource.asObservable();

  setActiveSubsection(section: Section) {
    this.activeSubsectionSource.next(section);
  }

  private showAreaSource = new BehaviorSubject<boolean>(false);
  showAreas = this.showAreaSource.asObservable();

  setShowArea(show: boolean) {
    this.showAreaSource.next(show);
  }

  private showBeaconSource = new BehaviorSubject<boolean>(true);
  showBeacons = this.showBeaconSource.asObservable();

  setShowBeacon(show: boolean) {
    this.showBeaconSource.next(show);
  }

  constructor(private http: HttpClient,
    @Inject('BASE_URL') private baseUrl: string
    ) {}
}
