import { ActiveService } from './../services/activeService';
import { MapService } from './../services/beaconClickService';
import { Vertex } from './../models/vertex';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { HttpService } from '../services/httpService';
import { Section } from '../models/section';
import { Edge } from '../models/edge';

@Component({
  selector: 'app-routing-component',
  templateUrl: './routing-component.component.html',
  styleUrls: ['./routing-component.component.scss'],
})
export class RoutingComponentComponent implements OnInit, AfterViewInit {
  directed = false;
  connectSpecific = false;
  hideConnections = false;
  freeLine = false;
  addVertex = true;
  showRelated = false;

  verticesExist = false;
  vertex: Vertex | null = null;
  vertices: Vertex[] = [];

  activeSection: Section | null = null;

  addHistory: Vertex[] = [];

  @ViewChild('vertexDropdown') vertexDropdown!: ElementRef;
  @ViewChild('dropdownDiv') dropdownDiv: ElementRef | undefined;

  public toggleDirected(event: MatSlideToggleChange) {
    this.directed = event.checked;
  }

  public toggledConnected(event: MatSlideToggleChange) {
    this.connectSpecific = event.checked;
  }

  public toggleConnections(event: MatSlideToggleChange) {
    this.hideConnections = event.checked;
    this.activeService.setShowConnections(!this.hideConnections);
  }

  public toggleLineOrientation(event: MatSlideToggleChange) {
    this.freeLine = event.checked;
  }

  public toggleAddVertex(event: MatSlideToggleChange) {
    this.addVertex = event.checked;
  }

  public toggleShowRelated(event: MatSlideToggleChange) {
    this.showRelated = event.checked;
    this.activeService.showRelatedToActiveVertex(this.showRelated);
  }

  selectVertex(vertexFakeId: string) {
    // set active
  }

  verticesUpdated() {
    if (this.vertices.length > 0) {
      if (this.vertex) {
        this.vertexDropdown.nativeElement.innerHTML = this.vertex!.vertexName!;
      } else {
        this.vertexDropdown.nativeElement.innerHTML =
          this.vertices[0].vertexName!;
        this.vertex = this.vertices[0];
      }
      this.verticesExist = true;
      this.dropdownDiv!.nativeElement.classList.remove('disabled');
      this.vertexDropdown.nativeElement.classList.remove('disabled');
      this.vertexDropdown.nativeElement.value = this.vertex!.fakeId;
    } else {
      this.dropdownDiv!.nativeElement.classList.add('disabled');
      this.vertexDropdown.nativeElement.innerHTML = 'No Vertices Added';
      this.vertexDropdown.nativeElement.classList.add('disabled');
      this.verticesExist = false;
    }
    let edges: Edge[] = [];
    this.vertices.forEach((vertex) => {
      vertex.edges.forEach((edge) => {
        edges.push(new Edge(0, vertex, edge));
      });
    });
    let uniqueEdges: Edge[] = [];
    edges.forEach((edge) => {
      let found = false;
      uniqueEdges.forEach((uniqueEdge) => {
        if (uniqueEdge.fakeId == edge.fakeId) {
          found = true;
        }
      });
      if (!found) {
        uniqueEdges.push(edge);
      }
    });
    edges = uniqueEdges;
    this.activeSection!.edges = edges;
    this.activeSection!.vertices = this.vertices;
    this.activeService.updateVertices(this.vertices);
  }

  removeVertex() {
    if (this.vertex) {
      this.vertices = this.vertices.filter(
        (vertex) => vertex.fakeId != this.vertex!.fakeId
      );
      this.vertices.forEach((vertex) => {
        vertex.edges = vertex.edges.filter(
          (edge) => edge.fakeId != this.vertex!.fakeId
        );
      });
      this.verticesUpdated();
    }
  }

  constructor(
    private mapService: MapService,
    private activeService: ActiveService,
    private httpService: HttpService
  ) {
    this.mapService.latestClick.subscribe((position) => {
      if (this.mapService.activeTab == 'routing') {
        if (!this.activeSection) {
          return;
        }
        if (!this.addVertex) {
          return;
        }
        let posX = position[0];
        let posY = position[1];
        if (!this.freeLine) {
          if (this.vertex) {
            let xDiff = Math.abs(this.vertex.x - posX);
            let yDiff = Math.abs(this.vertex.y - posY);
            if (xDiff < yDiff) {
              posX = this.vertex.x;
            } else {
              posY = this.vertex.y;
            }
          }
        }

        let newVertex = new Vertex(
          '0',
          'Vertex ' + this.vertices.length,
          posX,
          posY
        );
        this.vertices.push(newVertex);
        let newEdge = this.vertex?.addEdge(newVertex);
        if (!this.directed && this.vertex) {
          let newEdge2 = newVertex.addEdge(this.vertex!);
        }
        if (!this.connectSpecific) {
          this.vertex = newVertex;
        }
        this.addHistory.push(newVertex);
        this.verticesUpdated();
      }
    });
    this.mapService.latestRightClick.subscribe((position) => {
      if (this.addVertex) {
        while (this.addHistory.length > 0) {
          let poppedHistory = this.addHistory.pop();
          if (poppedHistory) {
            this.vertices = this.vertices.filter(
              (vertex) => vertex.fakeId != poppedHistory!.fakeId
            );
            let backsteps: Vertex[] = [];
            this.vertices.forEach((vertex) => {
              let beforeLength = vertex.edges.length;
              vertex.edges = vertex.edges.filter(
                (connection) => connection.fakeId != poppedHistory!.fakeId
              );
              let afterLength = vertex.edges.length;
              if (beforeLength != afterLength) {
                backsteps.push(vertex);
              }
            });
            if (this.vertex?.fakeId == poppedHistory.fakeId) {
              if (backsteps.length > 0) {
                this.vertex = backsteps[0];
              } else {
                this.vertex =
                  this.vertices.length > 0 ? this.vertices[-1] : null;
              }
            }
            this.verticesUpdated();
            break;
          }
        }
      }
    });
    this.activeService.rightClickedVertex.subscribe((vertexFakeId) => {
      this.addVertex = false;
      let vertex = this.vertices.find(
        (vertex) => vertex.fakeId == vertexFakeId
      );
      if (vertex) {
        let newEdge = this.vertex?.addEdge(vertex);
        if (!this.directed) {
          let newEdge2 = vertex.addEdge(this.vertex!);
        }
        this.verticesUpdated();
      }
    });
  }

  isActive() {
    return this.mapService.getActiveTab() === 'routing';
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.activeService.activeSection.subscribe((section) => {
      this.activeSection = section;
      this.httpService.getVerticesOfSection(section).subscribe((vertices) => {
        let uniqueVertices: Vertex[] = [];
        this.vertex = null;
        vertices.forEach((vertex) => {
          let found = false;
          uniqueVertices.forEach((uniqueVertex) => {
            if (uniqueVertex.fakeId == vertex.fakeId) {
              found = true;
            }
          });
          if (!found) {
            uniqueVertices.push(vertex);
          }
        });
        this.vertices = uniqueVertices;
        this.addHistory = uniqueVertices.sort((a, b) => a.fakeId - b.fakeId);
        this.httpService.getEdgesOfSection(section).subscribe((edges) => {
          this.vertices.forEach((vertex) => {
            vertex.edges = edges
              .filter((edge) => edge.vertexA.id == vertex.id)
              .map((edge) => edge.vertexB);
          });
          this.verticesUpdated();
        });
      });
    });
    this.activeService.activeVertex.subscribe((vertexFakeId) => {
      let vertex = this.vertices.find(
        (vertex) => vertex.fakeId == vertexFakeId
      );
      if (vertex) {
        this.connectSpecific = true;
        this.vertex = vertex;
      }
    });
    this.activeService.activeClickedEdge.subscribe((verticesOfEdge) => {
      if (
        this.isActive() &&
        verticesOfEdge != null &&
        verticesOfEdge.length >= 2
      ) {
        let vertexA = verticesOfEdge[0];
        let vertexB = verticesOfEdge[1];
        vertexA.edges = vertexA.edges.filter(
          (vertex) => vertex.fakeId != vertexB.fakeId
        );
        vertexB.edges = vertexB.edges.filter(
          (vertex) => vertex.fakeId != vertexA.fakeId
        );
        this.verticesUpdated();
      }
    });
  }
}
