import { Globals } from '../services/globals';

export class Project {
  static projectCache: Project[] = [];

  static parseObject(result: any): any {
    let newProject = Project.projectCache.find(
      (project) => project.id == result['id']
    );
    if (newProject == null || newProject == undefined) {
      newProject = new Project(result['id']);
    }
    if (result['projectName'] != null) {
      newProject.projectName = result['projectName'];
    }
    if (result['projectID'] != null) {
      newProject.projectId = result['projectID'];
    }
    if (result['projectDescription'] != null) {
      newProject.projectDescription = result['projectDescription'];
    }
    if (result['projectImage'] != null) {
      newProject.projectImage = result['projectImage'];
    }
    if (result['projectOwner'] != null) {
      newProject.projectOwner = result['projectOwner'];
    }
    if (result['contactEmail'] != null) {
      newProject.contactEmail = result['contactEmail'];
    }
    if (result['supervisor'] != null) {
      newProject.supervisor = result['supervisor'];
    }
    if (result['tags'] != null) {
      newProject.tags = result['tags'];
    }
    if (result['projectWebsite'] != null) {
      newProject.projectWebsite = result['projectWebsite'];
    }
    if (
      this.projectCache.find((project) => project.id == newProject!.id) == null
    ) {
      this.projectCache.push(newProject);
    }
    return newProject;
  }

  id: number | null;
  projectId: string | null = '';
  projectName: string = '';
  projectDescription: string = '';
  projectImage: string = '';
  projectOwner: string = '';
  contentType: string = 'image/png';
  contactEmail: string = '';
  supervisor: string = '';
  tags: string = '';
  projectWebsite: string = '';
  fakeId: number = Globals.getFakeId();

  constructor(id: number | null) {
    this.id = id;
  }

  get src() {
    if (this.projectImage == null || this.projectImage == undefined) {
      return 'https://www.freeiconspng.com/uploads/no-image-icon-15.png';
    }
    if (this.projectImage.startsWith('data:')) {
      return this.projectImage;
    }
    if (this.projectImage == '') {
      return 'https://www.freeiconspng.com/uploads/no-image-icon-15.png';
    }
    return 'data:' + this.contentType + ';base64,' + this.projectImage;
  }

  get link() {
    return '/manage-project?projectId=' + this.id;
  }

  toJson() {
    return {
      id: this.id,
      projectId: this.projectId,
      projectName: this.projectName,
      projectDescription: this.projectDescription,
      projectImage: this.projectImage,
      projectOwner: this.projectOwner,
      contactEmail: this.contactEmail,
      supervisor: this.supervisor,
      tags: this.tags,
      projectWebsite: this.projectWebsite,
      fakeId: this.fakeId,
    };
  }
}
