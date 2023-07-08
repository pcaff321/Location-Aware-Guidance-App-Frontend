import { Component, OnInit } from '@angular/core';
import { Project } from '../models/project';
import { HttpService } from '../services/httpService';

@Component({
  selector: 'app-my-projects',
  templateUrl: './my-projects.component.html',
  styleUrls: ['./my-projects.component.scss']
})
export class MyProjectsComponent implements OnInit {
  pageNumber = 1;
  totalPages = 0;
  projectsPerPage = 5;

  updateFilter($event: Event) {
    const filter = ($event.target as HTMLInputElement).value;
    let newProjects = this.allProjects.filter((project) => {
      return project.projectName?.toLowerCase().includes(filter.toLowerCase()) || project.projectDescription?.toLowerCase().includes(filter.toLowerCase()) || project.projectOwner?.toLowerCase().includes(filter.toLowerCase()) || project.supervisor?.toLowerCase().includes(filter.toLowerCase());
    });
    this.updatePageNumbers(newProjects);
    this.projects = newProjects;
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

  projects: Project[] = [];
  allProjects: Project[] = [];

  constructor(
    private httpService: HttpService
  ) {
    httpService.getProjects().then((projects) => {
      projects.subscribe((projects: Project[]) => {
        this.projects = projects;
        this.allProjects = projects;
        this.updatePageNumbers(projects);
      });
    });
  }

  ngOnInit(): void {
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

}
