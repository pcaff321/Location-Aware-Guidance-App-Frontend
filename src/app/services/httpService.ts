import { ProjectToSection } from './../models/projectToSection';
import { Beacon } from './../models/beacon';
import { NetworkDevice } from './../models/networkDevice';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, Subscription } from 'rxjs';
import { SiteMap } from '../models/siteMap';
import { Section } from '../models/section';
import { ActiveService } from './activeService';
import { MapService } from './beaconClickService';
import { MapPoint } from '../models/mapPoint';
import { Site } from '../models/site';
import { Project } from '../models/project';
import { Vertex } from '../models/vertex';
import { Edge } from '../models/edge';
import { Door } from '../models/door';
import { Hint } from '../models/hint';
import { Globals } from './globals';

@Injectable()
export class HttpService {
  adminPassword = Globals.ADMIN_PASSWORD;

  async getMaps() {
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

  submitForm(form: any, endpoint: string): any {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (typeof form === 'string') {
      form = JSON.parse(form);
    }
    if (form["adminPassword"] == null) {
      form["adminPassword"] = this.adminPassword;
    }
    return this.http.post(endpoint, JSON.stringify(form), { headers: headers });
  }

  async getSiteMaps() {
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

  async getProjects() {
    return this.http.get<String>(this.baseUrl + 'projects/').pipe(
      map((result: any) => {
        let projects = [];
        for (let project of result) {
          projects.push(Project.parseObject(project));
        }
        return projects;
      }),
      catchError((error) => {
        console.error(error);
        return of([]);
      })
    );
  }

  async getSiteMap(id: string) {
    return this.http.get<String>(this.baseUrl + 'maps/' + id).pipe(
      map((result: any) => {
        return SiteMap.parseObject(result);
      }),
      catchError((error) => {
        console.error(error);
        return of(null);
      })
    );
  }

  async getNetworkDevices() {
    return this.http.get<String>(this.baseUrl + 'networkdevices/').pipe(
      map((result: any) => {
        let networkDevices = [];
        for (let device of result) {
          networkDevices.push(NetworkDevice.parseObject(device));
        }
        return networkDevices;
      }),
      catchError((error) => {
        console.error(error);
        return of([]);
      })
    );
  }

  async getSectionsBySiteId(id: string) {
    return this.http
      .get<String>(this.baseUrl + 'sections/getSectionsBySiteId/' + id)
      .pipe(
        map((result: any) => {
          let sections: Section[] = [];
          for (let section of result) {
            sections.push(Section.parseObject(section));
          }
          return this.processSections(sections);
        }),
        catchError((error) => {
          console.error(error);
          return of([]);
        })
      );
  }

  async getSections() {
    return this.http.get<String>(this.baseUrl + 'sections/').pipe(
      map((result: any) => {
        let sections = [];
        for (let section of result) {
          sections.push(Section.parseObject(section));
        }
        return sections;
      }),
      catchError((error) => {
        console.error(error);
        return of([]);
      })
    );
  }

  async getSection(id: string) {
    return this.http.get<String>(this.baseUrl + 'sections/' + id).pipe(
      map((result: any) => {
        return Section.parseObject(result);
      }),
      catchError((error) => {
        console.error(error);
        return of(null);
      })
    );
  }

  async processSections(sectionsWithDuplicates: Section[]): Promise<Section[]> {
    let sections: Section[] = [];
    for (let section of sectionsWithDuplicates) {
      if (!sections.includes(section)) {
        sections.push(section);
      }
    }
    let processedSections: Section[] = [];
    for (let section of sections) {
      if (section.outerMap == null && !processedSections.includes(section)) {
        processedSections.push(section);
      }
      section.subsections = await this.getSubsections(section, sections);
    }
    return processedSections;
  }

  async getSubsections(
    section: Section,
    sections: Section[]
  ): Promise<Section[]> {
    let subsections: Section[] = [];
    for (let subsection of sections) {
      if (
        subsection.outerMap != null &&
        subsection.outerMap.mapId == section.innerMap!.mapId
      ) {
        subsections.push(subsection);
      }
    }
    return subsections;
  }

  constructor(
    private http: HttpClient,
    @Inject('BASE_URL') private baseUrl: string,
    private activeService: ActiveService,
    private beaconClickService: MapService
  ) {}

  saveAllSiteUpdates() {
    this.activeService.activeSite.subscribe((site) => {
      this.activeService.updateAvailableMaps();
      let startSection = site.startSection;
      let mapPoints = this.getMapPoints();
      let sectionsList = this.getSectionsDictionary(site);
      let data = {
        siteId: site.id,
        startSectionFakeId: startSection!.fakeId,
        mapPoints: mapPoints,
        sections: sectionsList,
      };
      let errors = this.errorCheckSections(data.sections);
      if (errors != '') {
        alert(errors);
        return;
      }
      errors = this.errorCheckMapPoints(data.mapPoints);
      if (errors != '') {
        alert(errors);
        return;
      }
      this.submitForm(data, this.baseUrl + 'sites/saveAll').subscribe(
        (response: any) => {
          console.log(response);
        }
      );
    });
  }

  errorCheckSections(sections: any) {
    let errorMessage = '';
    sections.forEach((section: any) => {
      if (
        section.innerMap == null ||
        section.innerMap == undefined ||
        section.innerMap.id == null ||
        section.innerMap.id == undefined ||
        (section.innerMap.id as string) === '' ||
        (section.innerMap.id as string) === '0'
      ) {
        errorMessage +=
          'Section ' + section.sectionName + ' has no inner map' + '\n';
      }
    });
    return errorMessage;
  }

  errorCheckMapPoints(mapPoints: any) {
    let errorMessage = '';
    mapPoints.forEach((mapPoint: any) => {
      if (
        mapPoint.networkDeviceId == null ||
        mapPoint.networkDeviceId == undefined ||
        (mapPoint.networkDeviceId as string) === '' ||
        (mapPoint.networkDeviceId as string) === '0'
      ) {
        errorMessage +=
          'Map Point ' + mapPoint.name + ' has no network device on map ' + mapPoint.mapId + '\n';
        console.log("Error with map point");
        console.log(mapPoint)
      }
    });
    return errorMessage;
  }

  getMapPoints() {
    let mapPoints: {
      mapPointId: string | undefined;
      networkDeviceId: string | undefined;
      mapId: string | null;
      x: number | undefined;
      y: number | undefined;
      range: number | undefined;
      name: string | undefined;
    }[] = [];
    this.activeService.getTakenMaps.forEach((map) => {
      map.beacons.forEach((beacon: Beacon) => {
        let mapPoint = {
          mapPointId: beacon.uuids,
          networkDeviceId: beacon.networkDeviceId,
          mapId: map.mapId,
          x: beacon.locationX,
          y: beacon.locationY,
          range: beacon.range,
          name: beacon.beaconName || '',
        };
        mapPoints.push(mapPoint);
      });
    });
    return mapPoints;
  }

  makeSectionsOneList(tree: Section) {
    let sections: Section[] = [];
    sections.push(tree);
    for (let i = 0; i < tree.subsections.length; i++) {
      sections = sections.concat(this.makeSectionsOneList(tree.subsections[i]));
    }
    return sections;
  }

  getSectionsDictionary(site: Site) {
    let sections: {}[] = [];
    let sectionsList: Section[] = this.makeSectionsOneList(site.startSection!);
    sectionsList.forEach((section) => {
      section.subsections.forEach((subsection) => {
        subsection.outerMap = section.innerMap;
      });
    });

    sectionsList.forEach((section) => {
      let doorsNoDuplicates: any[] = [];
      let doorsOfSection: Door[] = section.doors || [];
      for (let door of doorsOfSection) {
        if (!doorsNoDuplicates.some((d) => d['doorFakeId'] == door.fakeId)) {
          doorsNoDuplicates.push(door.toJson());
        }
      }
      var projectLocationsOfSection: {}[] = section.getProjectLocations();
      let sectionVerticesNoDuplicates: { id: string; vertexName: string; x: number; y: number; fakeId: number; }[] = [];
      let sectionVertices = section.vertices ? section.vertices.map((vertex) => vertex.toJson()) : [];
      for (let vertex of sectionVertices) {
        if (!sectionVerticesNoDuplicates.some((v) => v['fakeId'] == vertex['fakeId'])) {
          sectionVerticesNoDuplicates.push(vertex);
        }
      }
      let sectionEdgesNoDuplicates: { id: number; vertexAid: string; vertexBid: string; vertexAfakeId: number; vertexBfakeId: number; fakeId: number; }[] = [];
      let sectionEdges = section.edges ? section.edges.map((edge) => edge.toJson()) : [];
      for (let edge of sectionEdges) {
        if (!sectionEdgesNoDuplicates.some((e) => e['fakeId'] == edge['fakeId'])) {
          sectionEdgesNoDuplicates.push(edge);
        }
      }
      let mapPoints: {
        mapPointId: string | undefined;
        networkDeviceId: string | undefined;
        mapId: string | null;
        x: number | undefined;
        y: number | undefined;
        range: number | undefined;
        name: string | undefined;
      }[] = [];
      section.innerMap!.beacons.forEach((beacon: Beacon) => {
          let mapPoint = {
            mapPointId: beacon.uuids,
            networkDeviceId: beacon.networkDeviceId,
            mapId: section.innerMap!.mapId,
            x: beacon.locationX,
            y: beacon.locationY,
            range: beacon.range,
            name: beacon.beaconName || '',
          };
          mapPoints.push(mapPoint);
        });

      var updateProjectLocationsInt = projectLocationsOfSection.length > 0 ? 1 : 0;
      if (this.updatedProjectLocations.some((projectLocationSectionId) => projectLocationSectionId == (section.id ?? 0).toString())) {
        updateProjectLocationsInt = 1;
      }
      if (section.id == undefined || section.id == null || section.id <= 0) {
        updateProjectLocationsInt = 1;
      }
      updateProjectLocationsInt = 0;
      let sectionObject = {
        sectionId: section.id,
        innerMap: section.innerMap?.toJson(),
        outerMap: section.outerMap?.toJson(),
        topLeftX: section.topLeftX,
        topLeftY: section.topLeftY,
        mapPoints: mapPoints,
        bottomRightX: section.bottomRightX,
        bottomRightY: section.bottomRightY,
        sectionName: section.sectionName,
        fakeId: section.fakeId,
        projects: section.projects ? section.projects.map((project) => project.id) : [],
        vertices: sectionVerticesNoDuplicates,
        edges: sectionEdgesNoDuplicates,
        doors: doorsNoDuplicates,
        hints: section.hints ? section.hints.map((hint) => hint.toJson()) : [],
        projectLocations: projectLocationsOfSection,
        updateHints : section.hints ? 1 : 0,
        updateRouting : (section.edges != undefined && section.vertices != undefined) ? 1 : 0,
        updateProjects : section.projects ? 1 : 0,
        updateDoors : section.doors ? 1 : 0,
        updateProjectLocations : updateProjectLocationsInt,
      };
      sections.push(sectionObject);
    });
    return sections;
  }

  getDoorsOfSection(section: Section): Observable<Door[]> {
    if (section.doors) {
      return of(section.doors);
    }
    if (!section.id) {
      return of([]);
    }
    let doors: Door[] = [];
    return this.http.get<String>(this.baseUrl + 'doors/getBySectionId/' + section.id).pipe(
      map((result: any) => {
        for (let door of result) {
          door["sectionId"] = door.section.id;
          door["vertexId"] = door.vertex.id;
          doors.push(Door.parseObject(door));
        }
        section.doors = doors;
        return doors;
      }),
      catchError((error) => {
        console.error(error);
        return of([]);
      })
    );
  }


  getProjectsOfSite(site: Site): Observable<Project[]> {
    if (site.projects) {
      return of(site.projects);
    }
    if (!site.id) {
      return of([]);
    }
    return this.http.get<String>(this.baseUrl + 'projects/getBySiteId/' + site.id).pipe(
      map((result: any) => {
        let projects = [];
        for (let project of result) {
          projects.push(Project.parseObject(project));
        }
        site.projects = projects;
        return projects;
      }),
      catchError((error) => {
        console.error(error);
        return of([]);
      })
    );
  }

  getProjectsOfSection(section: Section): Observable<Project[]> {
    if (section.projects != null) {
      return of(section.projects);
    }
    if (!section.id) {
      return of([]);
    }
    return this.http.get<String>(this.baseUrl + 'projects/getBySectionId/' + section.id).pipe(
      map((result: any) => {
        let projects = [];
        for (let project of result) {
          projects.push(Project.parseObject(project));
        }
        section.projects = projects;
        return projects;
      }),
      catchError((error) => {
        console.error(error);
        return of([]);
      })
    );
  }

  getHintsOfSection(section: Section): Observable<Hint[]> {
    if (section.hints) {
      return of(section.hints);
    }
    if (!section.id) {
      return of([]);
    }
    return this.http.get<String>(this.baseUrl + 'hints/getBySectionId/' + section.id).pipe(
      map((result: any) => {
        let hints = [];
        for (let hint of result) {
          hints.push(Hint.parseObject(hint));
        }
        section.hints = hints;
        return hints;
      }),
      catchError((error) => {
        console.error(error);
        return of([]);
      })
    );
  }

  maxRetries = 3;
  attempts: {[key: string]: number} = {};

  getEdgesOfSection(section: Section): Observable<Edge[]> {
    if (section.edges && section.edges.length > 0) {
      return of(section.edges);
    }
    if (this.attempts[section.fakeId.toString()] == undefined){
      this.attempts[section.fakeId.toString()] = 0;
    }
    if (this.maxRetries <= this.attempts[section.fakeId.toString()]) {
      return of([]);
    }
    if (!section.id) {
      return of([]);
    }
    if (!section.vertices){
      this.getVerticesOfSection(section).subscribe();
    }
    this.attempts[section.fakeId.toString()] = this.attempts[section.fakeId.toString()] + 1;
    return this.http.get<String>(this.baseUrl + 'edges/getBySectionId/' + section.id).pipe(
      map((result: any) => {
        let edges = [];
        for (let edge of result) {
          edges.push(Edge.parseObject(edge));
        }
        section.edges = edges;
        return edges;
      }),
      catchError((error) => {
        console.error(error);
        return of([]);
      })
    );
  }

  getVerticesOfSection(section: Section): Observable<Vertex[]> {
    if (section.vertices) {
      return of(section.vertices);
    }
    if (!section.id) {
      return of([]);
    }
    return this.http.get<String>(this.baseUrl + 'vertices/getBySectionId/' + section.id).pipe(
      map((result: any) => {
        let vertices = [];
        for (let vertex of result) {
          vertices.push(Vertex.parseObject(vertex));
        }
        section.vertices = vertices;
        return vertices;
      }),
      catchError((error) => {
        console.error(error);
        return of([]);
      })
    );
  }


  updateMapPoints(maps: SiteMap[]) {
    let mapIds: string[] = [];
    maps.forEach((siteMap: SiteMap) => {
      if (siteMap.mapId == null || siteMap.mapId == undefined){
        console.warn("updateMapPoints: No map id for: " + siteMap.mapName)
      }else{
      mapIds.push(siteMap.mapId?.toString()!);
      }
    });
    if (mapIds.length == 0) {
      return;
    }
    let data = {
      mapIds: mapIds,
    };
    this.submitForm(data, this.baseUrl + 'mappoints/getAll').subscribe(
      (response: any) => {
        let mapPoints: MapPoint[] = [];
        let mapPointsDictionary: { [key: string]: MapPoint[] } = {};
        maps.forEach((map) => {
          mapPointsDictionary[map.mapId!] = [];
        });
        response.forEach((mapPoint: any) => {
          let mapPointObject: MapPoint = MapPoint.parseObject(mapPoint);
          mapPoints.push(mapPointObject);
          if (mapPointObject.map?.mapId!) {
            mapPointsDictionary[mapPointObject.map?.mapId!].push(mapPointObject);
          }
        });
        this.activeService.updateAvailableMaps();
        this.activeService.getTakenMaps.forEach((map) => {
          if (mapPointsDictionary[map.mapId!]) {
            mapPointsDictionary[map.mapId!].forEach((mapMapPoint) => {
            if (!map.beacons.includes(mapMapPoint.beacon)) {
              map.beacons.push(mapMapPoint.beacon);
            }
          });
          }
        });

      }
    );
  }

  updateMapPointsBySectionId(sectionId: string, maps: SiteMap[]) {
    let mapIds: string[] = [];
    maps.forEach((siteMap: SiteMap) => {
      if (siteMap.mapId == null || siteMap.mapId == undefined){
        console.warn("No map id for: " + siteMap.mapName)
      }else{
      mapIds.push(siteMap.mapId?.toString()!);
      }
    });
    if (mapIds.length == 0) {
      return;
    }
    this.http.get(this.baseUrl + 'mappoints/getBySectionId/' + sectionId).subscribe(
      (response: any) => {
        let mapPoints: MapPoint[] = [];
        let mapPointsDictionary: { [key: string]: MapPoint[] } = {};
        maps.forEach((map) => {
          mapPointsDictionary[map.mapId!] = [];
        });
        response.forEach((mapPoint: any) => {
          let mapPointObject: MapPoint = MapPoint.parseObject(mapPoint);
          mapPoints.push(mapPointObject);
          if (mapPointObject.map?.mapId!) {
            mapPointsDictionary[mapPointObject.map?.mapId!].push(mapPointObject);
          }
        });
        this.activeService.updateAvailableMaps();
        maps.forEach((map) => {
          if (mapPointsDictionary[map.mapId!]) {
            mapPointsDictionary[map.mapId!].forEach((mapMapPoint) => {
            if (!map.beacons.includes(mapMapPoint.beacon)) {
              map.beacons.push(mapMapPoint.beacon);
            }
          });
          } else {
            console.log("No map points for map: " + map.mapName);
          }
        });

      }
    );
  }

  updatedProjectLocations : String[] = [];

  updateProjectLocations(sections: Section[]) {
    let sectionIds: string[] = [];
    sections.forEach((section: Section) => {
      if (section.id == null || section.id == undefined || section.id < 1 || section.projects != null){
        console.warn("No section id for: " + section.sectionName)
      }else{
      sectionIds.push(section.id.toString()!);
      }
    });
    if (sectionIds.length == 0) {
      return;
    }
    let data = {
      sectionIds: sectionIds,
    };
    this.submitForm(data, this.baseUrl + 'projectLocations/getAll').subscribe(
      (response: any) => {
        let projectToSections: ProjectToSection[] = [];
        let p2sDictionary: { [key: string]: ProjectToSection[] } = {};
        sections.forEach((section) => {
          p2sDictionary[section.id!] = [];
        });
        response.forEach((p2s: any) => {
          p2s["section"] = sections.find(s => s.id == p2s["section"]["id"]);
          if (p2s["section"] == undefined) {
            return;
          }
          if (!this.updatedProjectLocations.some(p => p == p2s["section"]["id"])) {
            this.updatedProjectLocations.push(p2s["section"]["id"]);
          }
          let projectToSectionObject: ProjectToSection = ProjectToSection.parseObject(p2s);
          projectToSections.push(projectToSectionObject);
          p2sDictionary[projectToSectionObject.section.id!].push(projectToSectionObject);
        });
        this.activeService.updateAvailableMaps();
      }
    );
  }
}
