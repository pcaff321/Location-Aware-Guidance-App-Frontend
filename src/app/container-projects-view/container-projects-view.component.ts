import { ProjectToSection } from './../models/projectToSection';
import { MapService } from './../services/beaconClickService';
import { HttpService } from './../services/httpService';
import { Section } from './../models/section';
import { ActiveService } from './../services/activeService';
import { Component, OnInit } from '@angular/core';
import { Project } from '../models/project';

@Component({
  selector: 'app-container-projects-view',
  templateUrl: './container-projects-view.component.html',
  styleUrls: ['./container-projects-view.component.scss'],
})
export class ContainerProjectsViewComponent implements OnInit {
  projectFakeIdToProjectToSection: Map<number, ProjectToSection> = new Map<
    number,
    ProjectToSection
  >();


  pageNumber = 1;
  totalPages = 0;
  projectsPerPage = 5;


  updatePageNumbers(newProjects: Project[]) {
    let totalPageAmount = Math.ceil(newProjects.length / this.projectsPerPage);
    if (totalPageAmount < this.pageNumber) {
      this.pageNumber = totalPageAmount;
    }
    if (this.pageNumber < 1 && totalPageAmount > 0){
      this.pageNumber = 1;
    }
    this.totalPages = totalPageAmount;
  }


  decreasePage() {
    if (this.pageNumber > 1) {
      this.pageNumber--;
    } else {
      this.pageNumber = this.totalPages;
    }
  }
  increasePage() {
    if (this.pageNumber < this.totalPages) {
      this.pageNumber++;
    } else {
      this.pageNumber = 1;
    }
  }


  getXPosition(arg0: number) {
    var xPos = this.projectFakeIdToProjectToSection.get(arg0)?.x || 0;
    return xPos == 0 ? '' : xPos.toString();
  }

  getYPosition(arg0: number) {
    var yPos = this.projectFakeIdToProjectToSection.get(arg0)?.y || 0;
    return yPos == 0 ? '' : yPos.toString();
  }

  _activeProject?: Project;

  get activeProject() {
    return this._activeProject;
  }

  set activeProject(value) {
    this._activeProject = value;
    this.activeService.updateActiveProject(value);
    this.mapService.updateClickMap();
  }

  deselectAll() {
    this.sectionProjects = [];
  }

  selectAll() {
    this.sectionProjects = this.allProjects.slice();
  }


  filterSaved = '';

  updateFilter($event: Event) {
    let filter = ($event.target as HTMLInputElement).value?.toLowerCase() || '';
    this._updateFilter(filter);
  }

  _updateFilter(filter: string) {
    let newProjects = this.allProjects.filter((p) => {
      return (
        p.projectName.toLowerCase().includes(filter) ||
        p.projectDescription.toLowerCase().includes(filter) ||
        p.projectWebsite.toLowerCase().includes(filter) ||
        p.projectId?.toString().toLowerCase().includes(filter)||
        p.supervisor.toLowerCase().includes(filter) ||
        p.projectOwner.toLowerCase().includes(filter)
      );
    });
    this.filterSaved = filter;
    this.updateProjectList(newProjects);
  }

  selectedOption: string = 'option1';

  updateProjectList(newProjects: Project[]) {
    if (this.selectedOption == 'option2') {
      newProjects = newProjects.filter((p) => {
        return this.sectionProjects.includes(p);
      });
    } else if (this.selectedOption == 'option3') {
      newProjects = newProjects.filter((p) => {
        return !this.sectionProjects.includes(p);
      });
    }
    this.updatePageNumbers(newProjects);
    this.projects = newProjects;
  }

  updateProjects(){
    this._updateFilter(this.filterSaved);
  }

  toggleProject(projectFakeId: number) {
    let project = Project.projectCache.find((p) => p.fakeId == projectFakeId);
    if (project) {
      if (this.sectionProjects.includes(project)) {
        this.sectionProjects = this.sectionProjects.filter((p) => p.id != project!.id);
        this.projectFakeIdToProjectToSection.delete(project.fakeId);
        if (this.activeProject == project) {
          this.activeProject = undefined;
        }
      } else {
        this.sectionProjects.push(project);
      }
      if (this.activeSection) {
        this.activeSection!.projects = this.sectionProjects;
        this.mapService.updateClickMap();
        let projectToSectionData = {
          project: project.toJson(),
          section: this.activeSectionJson,
          x: 0,
          y: 0,
        };
        this.projectFakeIdToProjectToSection.set(
          project.fakeId,
          ProjectToSection.parseObject(projectToSectionData)
        );
      }
    }
  }

  activateProject($event: Event, projectFakeId: number) {
    $event.preventDefault();
    let project = Project.projectCache.find((p) => p.fakeId == projectFakeId);
    if (project && this.sectionProjects.includes(project)) {
      if (this.activeProject == project) {
        this.activeProject = undefined;
      } else {
        this.activeProject = project;
      }
    }
    return false;
  }

  projectInSection(projectFakeId: number): any {
    let project = Project.projectCache.find((p) => p.fakeId == projectFakeId);
    if (project) {
      var included: boolean = this.sectionProjects.includes(project);
      if (included) {
        let projectToSectionData = {
          project: project.toJson(),
          section: this.activeSectionJson,
          x: 0,
          y: 0,
        };
        this.projectFakeIdToProjectToSection.set(
          project.fakeId,
          ProjectToSection.parseObject(projectToSectionData)
        );
      }
      return included;
    }
    return false;
  }

  allProjects: Project[] = [];
  projects: Project[] = [];
  sectionProjects: Project[] = [];
  activeSection: Section | undefined;
  activeSectionJson: any;

  constructor(
    private activeService: ActiveService,
    private httpService: HttpService,
    private mapService: MapService
  ) {
    this.activeService.activeSite.subscribe((site) => {
      if (site) {
        this.httpService
          .getProjectsOfSite(site)
          .pipe()
          .subscribe((projects) => {
            this.allProjects = projects;
            this.projects = projects;
            this.projects = this.projects.sort((a, b) => {
              if (a.projectId && b.projectId) {
                var parsedIdA = parseInt(a.projectId);
                var parsedIdB = parseInt(b.projectId);
              }
              return 0;
            });
            this.updatePageNumbers(this.projects);
          });
      }
    });
    this.activeService.activeSection.subscribe((section) => {
      this.activeSection = section;
      this.activeSectionJson = section?.toJson();
      if (section) {
        this.httpService
          .getProjectsOfSection(section)
          .pipe()
          .subscribe((projects) => {
            this.sectionProjects = projects;
            section.projects = projects;
          });
      }
    });

    this.activeService.projectClicked.subscribe((project) => {
      if (project && this.isActive() && this.projectInSection(project.fakeId)) {
        this.activeProject = project;
        if (this.selectedOption == 'option3') {
          this.selectedOption = 'option1';
          this.updateProjects();
        }
      }
    });

    this.mapService.latestClick.subscribe((points: number[]) => {
      if (!this.isActive()) {
        return;
      }
      if (points.length == 2 && this.activeProject != undefined && this.projectInSection(this.activeProject.fakeId)) {
        var projectToSectionData = {
          project: this.activeProject.toJson(),
          section: this.activeSectionJson,
          x: points[0],
          y: points[1],
        };
        var newP2S = ProjectToSection.parseObject(projectToSectionData);
        this.mapService.updateClickMap();
      }
    });
  }

  isActive() {
    return this.mapService.getActiveTab() === 'projects';
  }

  ngOnInit(): void {}
}
