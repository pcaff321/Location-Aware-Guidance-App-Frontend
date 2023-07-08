import { HttpService } from './../services/httpService';
import { Project } from './../models/project';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.scss'],
})
export class CreateProjectComponent implements OnInit {
  projectName: string = '';
  projectDescription: string = '';
  projectImage: File | null = null;
  projectOwner: string = '';
  contactEmail: string = '';
  supervisor: string = '';
  tags: string = '';
  projectWebsite: string = '';
  projectId: string | null = null;
  objectId: string | null = null;

  activeProject: Project | null = null;

  @ViewChild('projectId') projectIDElement: any;
  @ViewChild('projectName') projectNameElement: any;
  @ViewChild('projectDescription') projectDescriptionElement: any;
  @ViewChild('projectImage') projectImageElement: any;
  @ViewChild('projectOwner') projectOwnerElement: any;
  @ViewChild('contactEmail') contactEmailElement: any;
  @ViewChild('supervisor') supervisorElement: any;
  @ViewChild('tags') tagsElement: any;
  @ViewChild('projectWebsite') projectWebsiteElement: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private httpService: HttpService,
    private route: ActivatedRoute,
    @Inject('BASE_URL') private baseUrl: string
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      let lowerParams = new Map();
      params.keys.forEach((key) => {
        lowerParams.set(key.toLowerCase(), params.get(key));
      });
      this.projectId = lowerParams.get('projectid');
      if (this.projectId) {
        this.http
          .get<String>(this.baseUrl + 'projects/' + this.projectId)
          .subscribe(
            (data) => {
              let project = Project.parseObject(data);
              this.objectId = project.id;
              this.projectId = project.projectId;
              this.projectName = project.projectName;
              this.projectDescription = project.projectDescription;
              this.projectOwner = project.projectOwner;
              this.contactEmail = project.contactEmail;
              this.supervisor = project.supervisor;
              this.tags = project.tags;
              this.projectWebsite = project.projectWebsite;
              this.activeProject = project;

              this.updateView();
            },
            (error) => console.log(error)
          );
      } else {
        this.objectId = null;
        this.projectId = null;
        this.projectName = '';
        this.projectDescription = '';
        this.projectOwner = '';
        this.contactEmail = '';
        this.supervisor = '';
        this.tags = '';
        this.projectWebsite = '';
        this.activeProject = null;
      }
    });
  }

  updateView() {
    this.projectIDElement.nativeElement.value = this.projectId;
    this.projectNameElement.nativeElement.value = this.projectName;
    this.projectDescriptionElement.nativeElement.value =
      this.projectDescription;
    this.projectOwnerElement.nativeElement.value = this.projectOwner;
    this.contactEmailElement.nativeElement.value = this.contactEmail;
    this.supervisorElement.nativeElement.value = this.supervisor;
    this.tagsElement.nativeElement.value = this.tags;
    this.projectWebsiteElement.nativeElement.value = this.projectWebsite;
  }

  updateProjectName($event: Event) {
    this.projectName = ($event.target as HTMLInputElement).value;
  }

  updateProjectID($event: Event) {
    this.projectId = ($event.target as HTMLInputElement).value;
  }

  updateProjectDescription($event: Event) {
    this.projectDescription = ($event.target as HTMLInputElement).value;
  }

  updateMapImage($event: Event) {
    this.projectImage = ($event.target as HTMLInputElement).files![0];
  }

  updateProjectOwner($event: Event) {
    this.projectOwner = ($event.target as HTMLInputElement).value;
  }

  updateContactEmail($event: Event) {
    this.contactEmail = ($event.target as HTMLInputElement).value;
  }

  updateSupervisor($event: Event) {
    this.supervisor = ($event.target as HTMLInputElement).value;
  }

  updateTags($event: Event) {
    this.tags = ($event.target as HTMLInputElement).value;
  }

  updateProjectWebsite($event: Event) {
    this.projectWebsite = ($event.target as HTMLInputElement).value;
  }

  async submitForm(event: any) {
    event.preventDefault();
    if (this.validateForm()) {
      let contentType = this.projectImage?.type;
      let projectImage = (this.projectImage != undefined && this.projectImage != null) ? await this.toBase64(this.projectImage) : null;
      if (!projectImage) {
        let parsedObjectId = this.objectId ? parseInt(this.objectId) : null;
        if (parsedObjectId && parsedObjectId > 0 && this.activeProject) {
          contentType = this.activeProject.contentType;
          projectImage = this.activeProject.projectImage;
        }
      }
      if (!projectImage){
        if (this.activeProject != null && this.activeProject != undefined){
        projectImage = this.activeProject!.projectImage;
        } else {
          projectImage = "";
        }
      }
      let project = {
        id: this.objectId,
        projectId: this.projectId,
        projectName: this.projectName,
        projectDescription: this.projectDescription,
        contentType: contentType,
        projectImage: projectImage,
        projectOwner: this.projectOwner,
        contactEmail: this.contactEmail,
        supervisor: this.supervisor,
        tags: this.tags,
        projectWebsite: this.projectWebsite,
        adminPassword: this.httpService.adminPassword,
      };
      this.http.post(this.baseUrl + 'projects/', project).subscribe(
        (data) => {
          this.router.navigate(['/my-projects'], {
            queryParams: { projectId: data },
          });
        },
        (error) => console.log(error)
      );
    }

    return false;
  }

  validateForm() {
    return true;
  }

  toBase64 = (file: Blob | null | undefined) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file!);
      reader.onload = () => resolve(reader.result!.toString().split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
}
