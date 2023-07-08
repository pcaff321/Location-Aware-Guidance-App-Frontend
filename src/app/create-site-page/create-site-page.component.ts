import { Site } from './../models/site';
import { Project } from './../models/project';
import { HttpService } from './../services/httpService';
import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  Inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-create-site-page',
  templateUrl: './create-site-page.component.html',
  styleUrls: ['./create-site-page.component.scss'],
})
export class CreateSitePageComponent implements OnInit {

  selectedOption: string = 'option1';

  pageNumber = 1;
  totalPages = 0;
  projectsPerPage = 5;


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


  deselectAll() {
    this.siteProjects = [];
    this.updateProjects();
  }

  selectAll() {
    this.siteProjects = this.allProjects.slice();
    this.updateProjects();
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

  updateProjectList(newProjects: Project[]) {
    if (this.selectedOption == 'option2') {
      newProjects = newProjects.filter((p) => {
        return this.siteProjects.includes(p);
      });
    } else if (this.selectedOption == 'option3') {
      newProjects = newProjects.filter((p) => {
        return !this.siteProjects.includes(p);
      });
    }
    this.updatePageNumbers(newProjects);
    this.projects = newProjects;
  }

  updateProjects(){
    this._updateFilter(this.filterSaved);
  }

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

  toggleProject(projectFakeId: number) {
    let project = Project.projectCache.find((p) => p.fakeId == projectFakeId);
    if (project) {
      if (this.siteProjects.includes(project)) {
        this.siteProjects = this.siteProjects.filter((p) => p != project);
      } else {
        this.siteProjects.push(project);
      }
    }
    this.updateProjects();
  }
  projectInSite(projectFakeId: number): any {
    let project = Project.projectCache.find((p) => p.fakeId == projectFakeId);
    if (project) {
      return this.siteProjects.includes(project);
    }
    return false;
  }

  @ViewChild('siteName') siteNameElement: ElementRef | undefined;
  @ViewChild('siteDescription') siteDescriptionElement: ElementRef | undefined;
  @ViewChild('siteWebsite') siteWebsiteElement: ElementRef | undefined;

  private siteName?: string;
  private siteDescription?: string;
  private siteWebsite?: string;

  siteProjects: Project[] = [];

  siteId?: string;
  retrievedSite: Site | null = null;

  projects: Project[] = [];
  allProjects: Project[] = [];

  updateSiteWebsite($event: Event) {
    let newSiteWebsite = ($event.target as HTMLInputElement).value;
    this.siteWebsite = newSiteWebsite;
  }

  updateSiteDescription($event: Event) {
    this.siteDescription = ($event.target as HTMLInputElement).value;
  }

  updateSiteName($event: Event) {
    let newSiteName = ($event.target as HTMLInputElement).value;
    if (this.checkValidSiteName(newSiteName)) {
      this.siteName = newSiteName;
    }
  }

  constructor(
    private httpService: HttpService,
    @Inject('BASE_URL') private baseUrl: string,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {
    httpService.getProjects().then((projectsObservable) => {
      projectsObservable.subscribe((projects: Project[]) => {
        this.allProjects = projects;
        this.projects = projects;
        this.updatePageNumbers(projects);
      });
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      let lowerParams = new Map();
      params.keys.forEach((key) => {
        lowerParams.set(key.toLowerCase(), params.get(key));
      });
      this.siteId = lowerParams.get('siteid');
      if (this.siteId) {
        this.http.get<String>(this.baseUrl + 'sites/' + this.siteId).subscribe(
          (data) => {
            let site = Site.parseObject(data);
            this.siteName = site.siteName || '';
            this.siteDescription = site.siteDescription || '';
            this.siteWebsite = site.siteWebsite || '';
            this.retrievedSite = site;

            this.updateView();
          },
          (error) => console.log(error)
        );
      }

      this.http
        .get<string>(this.baseUrl + 'projects/getBySiteId/' + this.siteId)
        .subscribe((data) => {
          let foundProjects: Project[] = [];
          for (let project of data) {
            let p = Project.parseObject(project);
            foundProjects.push(p);
          }
          this.siteProjects = foundProjects;
        });
    });
  }

  updateView() {
    this.siteNameElement!.nativeElement.value = this.siteName || '';
    this.siteDescriptionElement!.nativeElement.value =
      this.siteDescription || '';
    this.siteWebsiteElement!.nativeElement.value = this.siteWebsite || '';
  }

  submitForm($event: Event) {
    $event.preventDefault();
    if (this.checkValidSiteName(this.siteName! || '')) {
      let projectIds = this.siteProjects
        .filter((p) => !(p.projectId == null || p.projectId == undefined))
        .map((p) => p.id);
      let site = {
        id: this.siteId,
        SiteName: this.siteName,
        SiteDescription: this.siteDescription,
        SiteWebsite: this.siteWebsite,
        ProjectIds: projectIds,
      };
      this.httpService
        .submitForm(JSON.stringify(site), this.baseUrl + 'sites')
        .subscribe((result: any) => {
          this.router.navigate(['/create-site'], {
            queryParams: { siteId: result.id },
          });
        });
    }
    return false;
  }

  checkValidSiteName(newSiteName: string): boolean {
    if (newSiteName.length > 0) {
      this.siteNameElement?.nativeElement.classList.remove('is-invalid');
      return true;
    } else {
      this.siteNameElement?.nativeElement.classList.add('is-invalid');
      return false;
    }
  }

  checkValidSiteWebsite(newSiteWebsite: string) {
    if (
      newSiteWebsite.length > 0 &&
      newSiteWebsite.includes('.') &&
      newSiteWebsite.startsWith('http') &&
      newSiteWebsite.includes('://')
    ) {
      this.siteNameElement?.nativeElement.classList.remove('is-invalid');
      return true;
    }
    this.siteNameElement?.nativeElement.classList.add('is-invalid');
    return false;
  }
}
