import { NetworkDevice } from './../models/networkDevice';
import { ProjectToSection } from './../models/projectToSection';
import { Hint } from './../models/hint';
import { Vertex } from './../models/vertex';
import { Globals } from './../services/globals';
import { ActiveService } from './../services/activeService';
import {
  AfterContentInit,
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MapService } from '../services/beaconClickService';
import { Beacon } from '../models/beacon';
import { SiteMap } from '../models/siteMap';
import { Section } from '../models/section';
import { Project } from '../models/project';

@Component({
  selector: 'app-image-clicker',
  templateUrl: './image-clicker.component.html',
  styleUrls: ['./image-clicker.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ImageClickerComponent implements OnInit, AfterContentInit {
  @Output('mapClick') mapClick: EventEmitter<any> = new EventEmitter();

  @ViewChild('mapImage') mapImage: any;
  beacons: Beacon[] = [];

  vertices: Vertex[] = [];

  map?: SiteMap;
  sections: Section[] = [];
  activeSection?: Section;

  projects?: Project[];

  activeVertexFakeId?: number;

  hints: Hint[] = [];

  sizingLocation1X: number = 0;
  sizingLocation1Y: number = 0;
  sizingLocation2X: number = 1;
  sizingLocation2Y: number = 1;

  getOriginalXY(event: any) {
    var explicitImageTarget = event.explicitOriginalTarget;
    var originalWidth = explicitImageTarget.naturalWidth;
    var originalHeight = explicitImageTarget.naturalHeight;

    var clientWidth = explicitImageTarget.clientWidth;
    var clientHeight = explicitImageTarget.clientHeight;

    var xRatio = originalWidth / clientWidth;
    var yRatio = originalHeight / clientHeight;

    let originalRelativeX = Math.round(event.offsetX * xRatio);
    let originalRelativeY = Math.round(event.offsetY * yRatio);

    return [originalRelativeX, originalRelativeY];
  }

  imageClick(event: any) {
    var originalXandY = this.getOriginalXY(event);
    var originalRelativeX = originalXandY[0];
    var originalRelativeY = originalXandY[1];

    this.clickService.updateLeftClick([
      originalRelativeX,
      originalRelativeY,
    ]);
  }

  imageRightClick(event: any) {
    event.preventDefault();
    var originalXandY = this.getOriginalXY(event);
    var originalRelativeX = originalXandY[0];
    var originalRelativeY = originalXandY[1];

    this.clickService.updateRightClick([
      originalRelativeX,
      originalRelativeY,
    ]);
    return false;
  }

  constructor(
    private clickService: MapService,
    private activeService: ActiveService
  ) {}

  ngOnInit(): void {}

  ngAfterContentInit() {
    this.clickService.currentBeacons.subscribe((beacons) => {
      this.beacons = beacons;
      this.updateBeaconsOnMap();
    });
    this.activeService.currentVertices.subscribe((vertices) => {
      this.vertices = vertices;
      this.updateVerticesOnMap();
    });
    this.activeService.activeMap.subscribe((map: SiteMap) => {
      if (
        map.mapImage != null &&
        map.mapImage != undefined &&
        map.mapImage != ''
      ) {
        this.map = map;
        this.sizingLocation1X = map.sizingLocation1X;
        this.sizingLocation1Y = map.sizingLocation1Y;
        this.sizingLocation2X = map.sizingLocation2X;
        this.sizingLocation2Y = map.sizingLocation2Y;
        this.updateMap();
      }
    });
    this.activeService.currentActiveSubsections.subscribe((sections) => {
      this.sections = sections;
      this.updateAreasOnMap();
    });
    this.activeService.showAreas.subscribe((show) => {
      this.showAreas(show);
    });
    this.activeService.showBeacons.subscribe((show) => {
      this.showBeacons(show);
    });
    this.activeService.showConnections.subscribe((show) => {
      this.showConnections = show;
      this.updateVerticesOnMap();
    });
    this.clickService.updateClickMapObservable.subscribe((update) => {
      this.updateMap();
    });
    this.clickService.activeTabObservable.subscribe((tab) => {
      this.areasOn = false;
      this.beaconsOn = false;
      this.sizingPointsOn = false;
      this.verticesOn = false;
      this.hintsOn = false;
      this.projectsOn = false;
      this.hideConnections = false;
      if (tab == Globals.roomsViewTab) {
        this.areasOn = true;
        this.hideConnections = true;
        this.verticesOn = true;
      } else if (tab == Globals.beaconsViewTab) {
        this.beaconsOn = true;
      } else if (tab == Globals.infoViewTab) {
        this.sizingPointsOn = true;
        this.hideConnections = true;
        this.verticesOn = true;
      } else if (tab == Globals.overviewViewTab) {
        this.areasOn = true;
      } else if (tab == Globals.routingViewTab) {
        this.verticesOn = true;
      } else if (tab == Globals.hintsViewTab) {
        this.hintsOn = true;
      } else if (tab == Globals.projectsViewTab) {
        this.projectsOn = true;
      }
      this.updateMap();
    });
    this.activeService.activeSection.subscribe((section) => {
      this.activeSection = section;
      this.projects = section.projects || [];
      this.hints = section.hints || [];
    });
    this.activeService.showRelatedToActiveVertexObservable.subscribe((show) => {
      this.showRelatedToVertex = show;
      this.updateMap();
    });
    this.activeService.activeVertex.subscribe((vertexFakeId) => {
      this.activeVertexFakeId = vertexFakeId;
      this.updateMap();
    });
  }

  onImageLoad() {
    this.updateMap();
  }

  updateMap() {
    this.updateBeaconsOnMap();
    this.updateAreasOnMap();
    this.updateSizingPointsOnMap();
    this.updateVerticesOnMap();
    this.updateHintsOnMap();
    this.updateProjectsOnMap();
  }

  private beaconsOn = true;
  private areasOn = false;
  private sizingPointsOn = false;
  private verticesOn = false;
  private hintsOn = false;
  private projectsOn = false;
  private hideConnections = false;

  private showConnections = true;
  private showRelatedToVertex = false;

  showAreas(show: boolean) {
    if (show) {
      this.areasOn = true;
      this.beaconsOn = false;
      this.sizingPointsOn = false;
      this.updateMap();
    } else {
      this.areasOn = false;
      this.removeAreas();
    }
  }

  showProjects(show: boolean) {
    this.projectsOn = show;
    this.updateMap();
  }


  showBeacons(show: boolean) {
    if (show) {
      this.beaconsOn = true;
      this.areasOn = false;
      this.sizingPointsOn = false;
    } else {
      this.beaconsOn = false;
      this.removeBeacons();
    }
    this.updateMap();
  }

  removeAreas() {
    var areas = document.getElementsByClassName('area');
    while (areas.length > 0) {
      areas[0].parentNode!.removeChild(areas[0]);
    }
  }

  removeSizingPoints() {
    var sizingPoints = document.getElementsByClassName('sizing-point');
    while (sizingPoints.length > 0) {
      sizingPoints[0].parentNode!.removeChild(sizingPoints[0]);
    }
  }

  getSizingLines() {
    let diameter = 10;

    let sizingPoint1 = document.createElement('div');
    sizingPoint1.className = 'sizing-point';
    let sizingPoint1XPosition = this.mapImage.nativeElement.offsetLeft;
    let sizingPoint1YPosition =
      this.mapImage.nativeElement.offsetTop +
      this.mapImage.nativeElement.clientHeight;
    sizingPoint1.style.left = sizingPoint1XPosition - diameter / 2 + 'px';
    sizingPoint1.style.top = sizingPoint1YPosition - diameter / 2 + 'px';
    sizingPoint1.style.position = 'absolute';
    sizingPoint1.style.width = diameter + 'px';
    sizingPoint1.style.height = diameter + 'px';
    sizingPoint1.style.borderRadius = '50%';
    sizingPoint1.style.backgroundColor = 'red';
    sizingPoint1.style.zIndex = '1000';

    let sizingPoint2 = document.createElement('div');
    sizingPoint2.className = 'sizing-point';
    let sizingPoint2XPosition =
      this.mapImage.nativeElement.offsetLeft +
      this.mapImage.nativeElement.clientWidth;
    let sizingPoint2YPosition =
      this.mapImage.nativeElement.offsetTop +
      this.mapImage.nativeElement.clientHeight;
    sizingPoint2.style.left = sizingPoint2XPosition - diameter / 2 + 'px';
    sizingPoint2.style.top = sizingPoint2YPosition - diameter / 2 + 'px';
    sizingPoint2.style.position = 'absolute';
    sizingPoint2.style.width = diameter + 'px';
    sizingPoint2.style.height = diameter + 'px';
    sizingPoint2.style.borderRadius = '50%';
    sizingPoint2.style.backgroundColor = 'red';
    sizingPoint2.style.zIndex = '1000';

    let sizingLine = document.createElement('div');
    sizingLine.className = 'sizing-point';
    sizingLine.style.position = 'absolute';
    sizingLine.style.backgroundColor = 'red';
    sizingLine.style.zIndex = '1000';
    let sizingLineXPosition = sizingPoint1XPosition;
    let sizingLineYPosition = sizingPoint1YPosition;
    let sizingLineWidth = sizingPoint2XPosition - sizingPoint1XPosition;
    sizingLine.style.left = sizingLineXPosition + 'px';
    sizingLine.style.top = sizingLineYPosition + 'px';
    sizingLine.style.width = sizingLineWidth + 'px';
    sizingLine.style.height = '2px';

    let sizingLineText = document.createElement('span');
    let isUpsideDown = sizingLineXPosition > sizingPoint2XPosition ? -1 : 1;
    sizingLineText.className = 'sizing-point';
    sizingLineText.style.position = 'absolute';
    sizingLineText.style.backgroundColor = 'red';
    sizingLineText.style.zIndex = '1000';
    sizingLineText.style.left = sizingLineXPosition + 'px';
    sizingLineText.style.top = sizingLineYPosition + 10 * isUpsideDown + 'px';
    sizingLineText.style.width = sizingLineWidth + 'px';
    sizingLineText.style.height = '15px';
    sizingLineText.style.color = 'red';
    sizingLineText.style.fontSize = '12px';
    sizingLineText.style.fontWeight = 'bold';
    sizingLineText.style.textAlign = 'center';
    sizingLineText.style.verticalAlign = 'middle';
    sizingLineText.style.border = 'none';
    sizingLineText.style.background = 'transparent';

    let lengthInMetres =
      (this.mapImage.nativeElement.clientWidth *
        this.mapImage.nativeElement.naturalWidth) /
      this.mapImage.nativeElement.clientWidth;
    lengthInMetres =
      Math.round(lengthInMetres * this.map!.metresPerPixel * 100) / 100;
    sizingLineText.innerHTML = lengthInMetres + 'm';

    return [sizingPoint1, sizingPoint2, sizingLine, sizingLineText];
  }

  getBottomSizingLines() {
    return this.getSizingLines();
  }

  getSizingPointsFromMap() {
    let diameter = 6;

    let sizingPoints = this.getSizingLines();
    let sizingPoint1 = sizingPoints[0];
    let sizingPoint2 = sizingPoints[1];
    let sizingLine = sizingPoints[2];
    let sizingLineText = sizingPoints[3];

    let sizingPoint1RelativePosX =
      Math.round(
        (this.sizingLocation1X * this.mapImage.nativeElement.clientWidth) /
          this.mapImage.nativeElement.naturalWidth
      ) + this.mapImage.nativeElement.offsetLeft;

    let sizingPoint1RelativePosY =
      Math.round(
        (this.sizingLocation1Y * this.mapImage.nativeElement.clientHeight) /
          this.mapImage.nativeElement.naturalHeight
      ) + this.mapImage.nativeElement.offsetTop;

    let sizingPoint2RelativePosX =
      Math.round(
        (this.sizingLocation2X * this.mapImage.nativeElement.clientWidth) /
          this.mapImage.nativeElement.naturalWidth
      ) + this.mapImage.nativeElement.offsetLeft;

    let sizingPoint2RelativePosY =
      Math.round(
        (this.sizingLocation2Y * this.mapImage.nativeElement.clientHeight) /
          this.mapImage.nativeElement.naturalHeight
      ) + this.mapImage.nativeElement.offsetTop;

    sizingPoint1.style.width = diameter + 'px';
    sizingPoint1.style.height = diameter + 'px';

    sizingPoint2.style.width = diameter + 'px';
    sizingPoint2.style.height = diameter + 'px';

    sizingPoint1.style.left = sizingPoint1RelativePosX - diameter / 2 + 'px';
    sizingPoint1.style.top = sizingPoint1RelativePosY - diameter / 2 + 'px';

    sizingPoint2.style.left = sizingPoint2RelativePosX - diameter / 2 + 'px';
    sizingPoint2.style.top = sizingPoint2RelativePosY - diameter / 2 + 'px';

    let sizingLineAngle = Math.atan2(
      sizingPoint2RelativePosY - sizingPoint1RelativePosY,
      sizingPoint2RelativePosX - sizingPoint1RelativePosX
    );
    sizingLine.style.transform = 'rotate(' + sizingLineAngle + 'rad)';
    sizingLine.style.transformOrigin = '0 0';

    let sizingLineXWithRotation = sizingPoint1RelativePosX;
    let sizingLineYWithRotation = sizingPoint1RelativePosY;
    sizingLine.style.left = sizingLineXWithRotation + 'px';
    sizingLine.style.top = sizingLineYWithRotation + 'px';

    let lineWidth =
      Math.sqrt(
        Math.pow(sizingPoint2RelativePosX - sizingPoint1RelativePosX, 2) +
          Math.pow(sizingPoint2RelativePosY - sizingPoint1RelativePosY, 2)
      ) + 'px';
    sizingLine.style.width = lineWidth;

    let isUpsideDown =
      sizingLineXWithRotation > sizingPoint2RelativePosX ? -1 : 1;

    sizingLineText.style.left = sizingLineXWithRotation + 'px';
    sizingLineText.style.top =
      sizingLineYWithRotation + 10 * isUpsideDown + 'px';
    sizingLineText.style.width = lineWidth;

    sizingLineText.style.transform = 'rotate(' + sizingLineAngle + 'rad)';
    sizingLineText.style.transformOrigin = '0 0';

    sizingLineText.innerHTML = this.map!.metresBetweenPoints + 'm';

    return [sizingPoint1, sizingPoint2, sizingLine, sizingLineText];
  }

  updateSizingPointsOnMap() {
    this.removeSizingPoints();
    if (!this.sizingPointsOn) {
      return;
    }
    let sizingPointsBottom = this.getBottomSizingLines();
    let sizingPoint1 = sizingPointsBottom[0];
    let sizingPoint2 = sizingPointsBottom[1];
    let sizingLine = sizingPointsBottom[2];
    let sizingLineText = sizingPointsBottom[3];

    this.mapImage.nativeElement.parentNode!.appendChild(sizingPoint1);
    this.mapImage.nativeElement.parentNode!.appendChild(sizingPoint2);
    this.mapImage.nativeElement.parentNode!.appendChild(sizingLine);
    this.mapImage.nativeElement.parentNode!.appendChild(sizingLineText);

    let sizingPointsFromMap = this.getSizingPointsFromMap();
    let sizingPoint1FromMap = sizingPointsFromMap[0];
    let sizingPoint2FromMap = sizingPointsFromMap[1];
    let sizingLineFromMap = sizingPointsFromMap[2];
    let sizingLineTextFromMap = sizingPointsFromMap[3];

    this.mapImage.nativeElement.parentNode!.appendChild(sizingPoint1FromMap);
    this.mapImage.nativeElement.parentNode!.appendChild(sizingPoint2FromMap);
    this.mapImage.nativeElement.parentNode!.appendChild(sizingLineFromMap);
    this.mapImage.nativeElement.parentNode!.appendChild(sizingLineTextFromMap);
  }

  updateAreasOnMap() {
    this.removeAreas();
    if (!this.areasOn) {
      return;
    }
    if (this.sections.length > 0) {
      this.sections.forEach((section, index) => {
        let sectionX = section.topLeftX || 0;
        let sectionY = section.topLeftY || 0;
        let sectionWidth = section.bottomRightX! - sectionX;
        let sectionHeight = section.bottomRightY! - sectionY;
        let areaElement = document.createElement('button') as HTMLButtonElement;
        areaElement.onclick = () => {
          let clickedSection = this.activeService.getSections.find(
            (sectionItem) => sectionItem.id === section.id
          );
          if (clickedSection != null) {
            this.activeService.clickedSection(clickedSection);
          }
        };

        let span = document.createElement('span');
        span.innerText = section.innerMap?.mapName || '';
        span.style.overflow = 'hidden';
        span.style.textOverflow = 'ellipsis';
        span.style.whiteSpace = 'nowrap';
        span.style.width = '100%';
        span.style.display = 'block';
        span.className = 'area-text';
        areaElement.appendChild(span);
        areaElement.title = section.innerMap?.mapName || '';
        areaElement.className = 'area';
        areaElement.style.position = 'absolute';
        let relativeX =
          Math.round(
            (sectionX * this.mapImage.nativeElement.clientWidth) /
              this.mapImage.nativeElement.naturalWidth
          ) + this.mapImage.nativeElement.offsetLeft;
        let relativeY =
          Math.round(
            (sectionY * this.mapImage.nativeElement.clientHeight) /
              this.mapImage.nativeElement.naturalHeight
          ) + this.mapImage.nativeElement.offsetTop;
        let relativeWidth = Math.round(
          (sectionWidth * this.mapImage.nativeElement.clientWidth) /
            this.mapImage.nativeElement.naturalWidth
        );
        let relativeHeight = Math.round(
          (sectionHeight * this.mapImage.nativeElement.clientHeight) /
            this.mapImage.nativeElement.naturalHeight
        );
        areaElement.style.left = relativeX + 'px';
        areaElement.style.top = relativeY + 'px';
        areaElement.style.width = relativeWidth + 'px';
        areaElement.style.height = relativeHeight + 'px';

        this.activeService.activeSubsection.subscribe((activeSubsection) => {
          if (activeSubsection?.id === section.id) {
            areaElement.classList.add('active');
            span.classList.add('active');
          } else {
            areaElement.classList.remove('active');
            span.classList.remove('active');
          }
        });

        this.mapImage.nativeElement.parentNode.appendChild(areaElement);
      });
    }
  }

  removeBeacons() {
    var beacons = document.getElementsByClassName('beacon');
    while (beacons.length > 0) {
      beacons[0].parentNode!.removeChild(beacons[0]);
    }
    var ranges = document.getElementsByClassName('beaconRange');
    while (ranges.length > 0) {
      ranges[0].parentNode!.removeChild(ranges[0]);
    }
  }

  updateBeaconsOnMap() {
    this.removeBeacons();
    if (!this.beaconsOn) {
      return;
    }
    if (this.beacons.length > 0) {
      this.beacons.forEach((beacon) => {
        let beaconX = beacon.locationX || 0;
        let beaconY = beacon.locationY || 0;
        let beaconName = beacon.fakeId.toString();
        beaconName = beacon.beaconName || beaconName;
        let beaconID = beacon.uuids;
        let beaconDiv = document.createElement('button') as HTMLButtonElement;
        beaconDiv.className = 'beacon';
        beaconDiv.id = beaconID || '';
        beaconDiv.style.position = 'absolute';
        let deviceName = beaconName;
        if (NetworkDevice.networkDeviceCache.filter((device) => device.id === beacon.networkDeviceId).length > 0) {
          deviceName = NetworkDevice.networkDeviceCache.filter((device) => device.id === beacon.networkDeviceId)[0].deviceName || beaconName;

        }
        if (deviceName.toLowerCase().includes('pink')){
          beaconDiv.style.borderColor = 'pink';
        }
        if (deviceName.toLowerCase().includes('- blue') || deviceName.includes('- Blue') || deviceName.includes('- blue') || deviceName.includes('blue label')){
          beaconDiv.style.borderColor = 'blue';
        }
        beaconDiv.style.backgroundColor = this.getBeaconColorByName(deviceName);
        let beaconWidth = 8;
        let halfDivSize = beaconWidth / 2;
        let relativeX =
          Math.round(
            (beaconX * this.mapImage.nativeElement.clientWidth) /
              this.mapImage.nativeElement.naturalWidth
          ) + this.mapImage.nativeElement.offsetLeft;
        let relativeY =
          Math.round(
            (beaconY * this.mapImage.nativeElement.clientHeight) /
              this.mapImage.nativeElement.naturalHeight
          ) + this.mapImage.nativeElement.offsetTop;
        beaconDiv.style.zIndex = '100';
        beaconDiv.style.left = relativeX - halfDivSize + 'px';
        beaconDiv.style.top = relativeY - halfDivSize + 'px';
        this.mapImage.nativeElement.parentNode.appendChild(beaconDiv);
        beaconDiv.onclick = () => {
          this.clickService.setActiveBeacon(beaconName || '');
        };

        let currentBeacon = this.clickService.currentActiveBeacon;
      });
    }
  }

  connectionsDictionary: Map<Vertex, Vertex[]> = new Map<Vertex, Vertex[]>();

  getBeaconColorByName(name: string) {
    let color = '#000000';
    name = name.toLowerCase();
    if (name.includes('white')) {
      color = '#ffff00';
      return color;
    } else if (name.includes('green')) {
      color = '#00ff00';
      return color;
    } else     if (name.includes('blue')) {
      if (name.includes('dark')) {
        color = '#0b4270';
      } else {
        color = '#0000ff';
      }
    }
    return color;
  }

  removeVertices() {
    var vertices = document.getElementsByClassName('vertex');
    while (vertices.length > 0) {
      vertices[0].parentNode!.removeChild(vertices[0]);
    }
    var connections = document.getElementsByClassName('connection');
    while (connections.length > 0) {
      connections[0].parentNode!.removeChild(connections[0]);
    }
    this.connectionsDictionary.clear();
  }

  updateVerticesOnMap() {
    this.removeVertices();
    if (!this.verticesOn) {
      return;
    }
    let diameter = 10;
    if (this.vertices.length > 0) {
      this.vertices.forEach((vertex) => {
        let vertexX = vertex.x || 0;
        let vertexY = vertex.y || 0;
        let vertexID = vertex.id;
        let vertexFakeId = vertex.fakeId;
        let vertexDiv = document.createElement('button') as HTMLButtonElement;
        vertexDiv.className = 'vertex';
        vertexDiv.id = vertexID || '';
        vertexDiv.style.position = 'absolute';
        vertexDiv.onclick = () => {
          this.activeService.setActiveVertex(vertexFakeId || 0);
        };
        vertexDiv.onmousedown = (e) => {
          if (e.button === 2) {
            this.activeService.setRightClickedVertex(vertexFakeId || 0);
          }
        };
        let halfDivSize = diameter / 2;
        let relativeX =
          Math.round(
            (vertexX * this.mapImage.nativeElement.clientWidth) /
              this.mapImage.nativeElement.naturalWidth
          ) + this.mapImage.nativeElement.offsetLeft;
        let relativeY =
          Math.round(
            (vertexY * this.mapImage.nativeElement.clientHeight) /
              this.mapImage.nativeElement.naturalHeight
          ) + this.mapImage.nativeElement.offsetTop;
        vertexDiv.style.zIndex = '100';
        vertexDiv.style.width = diameter + 'px';
        vertexDiv.style.height = diameter + 'px';
        vertexDiv.style.left = relativeX - halfDivSize + 'px';
        vertexDiv.style.top = relativeY - halfDivSize + 'px';
        vertexDiv.style.backgroundColor = 'gold';
        vertexDiv.style.borderRadius = '50%';
        vertexDiv.oncontextmenu = (e) => {
          e.preventDefault();
          return false;
        };
        vertexDiv.title = vertex.vertexName || 'Vertex [' + vertexID + ']';
        this.mapImage.nativeElement.parentNode.appendChild(vertexDiv);

        if (this.showConnections && !this.hideConnections) {
          this.drawConnectionsOfVertex(vertex);
        }

        this.activeService.activeVertex.subscribe((activeVertex) => {
          if (activeVertex === vertexFakeId) {
            vertexDiv.classList.add('active');
          } else {
            vertexDiv.classList.remove('active');
          }
        });
      });
    }
  }

  drawConnectionsOfVertex(vertex: Vertex) {
    if (this.showRelatedToVertex && !(vertex.fakeId == this.activeVertexFakeId)) {
      return;
    }
    let connections: Vertex[] = vertex.edges;
    if (connections.length > 0) {
      let vertexX = vertex.x || 0;
      let vertexY = vertex.y || 0;
      let relativeX = Math.round(
        (vertexX * this.mapImage.nativeElement.clientWidth) /
          this.mapImage.nativeElement.naturalWidth
      );
      let relativeY = Math.round(
        (vertexY * this.mapImage.nativeElement.clientHeight) /
          this.mapImage.nativeElement.naturalHeight +
          this.mapImage.nativeElement.offsetTop
      );
      let addedConnections: Vertex[] = [];
      let lineHeight = 5;
      connections.forEach((connection) => {
        let currentConnectionLines = this.connectionsDictionary.get(connection);
        if (!currentConnectionLines?.includes(vertex)) {
          let connectionX = connection.x || 0;
          let connectionY = connection.y || 0;
          let line = document.createElement('div') as HTMLDivElement;

          line.className = 'connection directed';
          line.classList.add('vertex-' + vertex.id);
          line.classList.add('vertex-' + connection.id);
          line.classList.add('directed');
          line.style.position = 'absolute';
          line.style.zIndex = '60';
          line.style.backgroundColor = this.showRelatedToVertex ? 'red' : 'yellow';
          line.style.opacity = '0.3';
          line.style.height = lineHeight + 'px';
          let relativeConnectionX = Math.round(
            (connectionX * this.mapImage.nativeElement.clientWidth) /
              this.mapImage.nativeElement.naturalWidth
          );
          let relativeConnectionY = Math.round(
            (connectionY * this.mapImage.nativeElement.clientHeight) /
              this.mapImage.nativeElement.naturalHeight +
              this.mapImage.nativeElement.offsetTop
          );
          let lineXPosition = relativeX + this.mapImage.nativeElement.offsetLeft;
          let upsideDown : number = 1;
          upsideDown = (relativeConnectionX > relativeX) ? -1 : 1;
          if (relativeConnectionX == relativeX){
            upsideDown = (relativeConnectionY >= relativeY) ? -1 : 1;
            lineXPosition = relativeX + this.mapImage.nativeElement.offsetLeft - lineHeight/2 * upsideDown;
          }
          let lineYPosition = relativeY + ((lineHeight / 2) * upsideDown);
          let lineWidth = Math.sqrt(
            Math.pow(relativeConnectionX - relativeX, 2) +
              Math.pow(relativeConnectionY - relativeY, 2)
          );
          line.style.left = lineXPosition + 'px';
          line.style.top = lineYPosition + 'px';
          line.style.width = lineWidth + 'px';
          let lineAngle = Math.atan2(
            connectionY - vertexY,
            connectionX - vertexX
          );
          line.style.transform = 'rotate(' + lineAngle + 'rad)';
          line.style.transformOrigin = '0 0';
          this.mapImage.nativeElement.parentNode.appendChild(line);

          line.onclick = () => {
            this.activeService.setActiveClickedEdge([vertex, connection]);
          };

          addedConnections.push(connection);
        } else {
          let exisitingConnection = document.getElementsByClassName(
            'vertex-' + connection.id + '.vertex-' + vertex.id
          );
          if (exisitingConnection.length > 0) {
            exisitingConnection[0].classList.remove('directed');
          }
        }
      });
      this.connectionsDictionary.set(vertex, addedConnections);
    }
  }

  removeHints() {
    let hints = document.getElementsByClassName('hintDiv');
    while (hints.length > 0) {
      hints[0].parentNode?.removeChild(hints[0]);
    }
  }

  updateHintsOnMap() {
    this.removeHints();
    if (!this.hintsOn) {
      return;
    }
    if (!this.activeSection){
      return;
    }
    this.hints = this.activeSection!.hints || [];
    if (this.hints.length > 0) {
      this.hints.forEach((hint) => {
        let hintX = hint.x || 0;
        let hintY = hint.y || 0;
        let hintID = hint.id.toString();
        let hintDiv = document.createElement('button') as HTMLButtonElement;
        hintDiv.className = 'hintDiv';
        hintDiv.id = hintID || '';
        hintDiv.style.position = 'absolute';
        hintDiv.onclick = () => {
          this.activeService.setActiveHint(hint);
        };
        let halfDivSize = 12 / 2;
        let relativeX =
          Math.round(
            (hintX * this.mapImage.nativeElement.clientWidth) /
              this.mapImage.nativeElement.naturalWidth
          ) + this.mapImage.nativeElement.offsetLeft;
        let relativeY =
          Math.round(
            (hintY * this.mapImage.nativeElement.clientHeight) /
              this.mapImage.nativeElement.naturalHeight
          ) + this.mapImage.nativeElement.offsetTop;
        hintDiv.style.zIndex = '100';
        hintDiv.style.left = relativeX - halfDivSize + 'px';
        hintDiv.style.top = relativeY - halfDivSize + 'px';
        hintDiv.title = hint.name || 'Hint [' + hintID + ']';
        this.mapImage.nativeElement.parentNode.appendChild(hintDiv);

        this.activeService.activeHint.subscribe((activeHint) => {
          if (activeHint == null){
            hintDiv.classList.remove('active');
            return;
          }
          if (activeHint === hint) {
            hintDiv.classList.add('active');
          } else {
            hintDiv.classList.remove('active');
          }
        });
      });
    }
  }

  removeProjects() {
    let projects = document.getElementsByClassName('projectDiv');
    while (projects.length > 0) {
      projects[0].parentNode?.removeChild(projects[0]);
    }
  }

  updateProjectsOnMap() {
    this.projects = this.activeSection?.projects || [];
    this.removeProjects();
    if (!this.projectsOn) {
      return;
    }
    if (!this.activeSection){
      return;
    }
    this.projects = this.activeSection!.projects || [];
    if (this.projects.length > 0) {
      var jsonOfSection = this.activeSection!.toJson();
      this.projects.forEach((project) => {
        var jsonOfProject = project.toJson();
        var dataOfP2S = {
          project: jsonOfProject,
          section: jsonOfSection,
        }
        let projectToSection = ProjectToSection.parseObject(dataOfP2S);
        let projectX = projectToSection?.x || 0;
        let projectY = projectToSection?.y || 0;
        let projectID = project.id?.toString() || project.fakeId.toString();
        let projectDiv = document.createElement('button') as HTMLButtonElement;
        projectDiv.className = 'projectDiv';
        projectDiv.id = projectID || '';
        projectDiv.style.position = 'absolute';
        let divSize = 10;
        let halfDivSize = divSize / 2;
        let relativeX =
          Math.round(
            (projectX * this.mapImage.nativeElement.clientWidth) /
              this.mapImage.nativeElement.naturalWidth
          ) + this.mapImage.nativeElement.offsetLeft;
        let relativeY =
          Math.round(
            (projectY * this.mapImage.nativeElement.clientHeight) /
              this.mapImage.nativeElement.naturalHeight
          ) + this.mapImage.nativeElement.offsetTop;
        projectDiv.style.zIndex = '100';
        projectDiv.style.left = relativeX - halfDivSize + 'px';
        projectDiv.style.top = relativeY - halfDivSize + 'px';
        projectDiv.style.width = divSize + 'px';
        projectDiv.style.height = divSize + 'px';
        projectDiv.style.backgroundColor = (this.activeService.activeProject == project) ? 'red' : 'green';
       // projectDiv.title = project.projectName || 'Project [' + projectID + ']';

        let projectHoverDiv = document.createElement('div') as HTMLDivElement;
        projectHoverDiv.className = 'projectHoverDiv';
        projectHoverDiv.style.position = 'absolute';
        projectHoverDiv.style.zIndex = '101';
        projectHoverDiv.style.maxWidth = '200px';
        projectHoverDiv.style.left = relativeX + halfDivSize + 'px';
        projectHoverDiv.style.top = relativeY - halfDivSize + 'px';
        projectHoverDiv.style.backgroundColor = 'white';
        projectHoverDiv.style.borderRadius = '10px';
        projectHoverDiv.style.border = '1px solid black';
        projectHoverDiv.style.padding = '5px';
        projectHoverDiv.classList.add('bg-light');

        let projectHoverDivTitle = document.createElement('h3') as HTMLHeadingElement;
        projectHoverDivTitle.className = 'projectHoverDivTitle';
        projectHoverDivTitle.classList.add('display-3');
        projectHoverDivTitle.style.fontWeight = 'bold';
        projectHoverDivTitle.style.position = 'relative';
        projectHoverDivTitle.style.zIndex = '101';
        projectHoverDivTitle.innerHTML = project.projectName || 'Project [' + projectID + ']';

        let projectHoverDivUser = document.createElement('h3') as HTMLHeadingElement;
        projectHoverDivUser.className = 'projectHoverDivDescription';
        projectHoverDivUser.classList.add('display-3');
        projectHoverDivUser.style.fontStyle = 'italic';
        projectHoverDivUser.style.position = 'relative';
        projectHoverDivUser.style.zIndex = '101';
        projectHoverDivUser.innerHTML = project.projectOwner + ' [' + project.projectId + ']' || 'Project [' + projectID + ']';

        projectHoverDiv.appendChild(projectHoverDivTitle);
        projectHoverDiv.appendChild(projectHoverDivUser);

        projectDiv.onmouseenter = () => {
          projectHoverDiv.style.display = 'block';
        };

        projectDiv.onmouseleave = () => {
          projectHoverDiv.style.display = 'none';
        };

        this.mapImage.nativeElement.parentNode.appendChild(projectHoverDiv);

        projectHoverDiv.style.display = 'none';

        projectDiv.onclick = () => {
          this.activeService.setProjectClicked(project);
        };
        this.mapImage.nativeElement.parentNode.appendChild(projectDiv);

      });
    }
  }


}
