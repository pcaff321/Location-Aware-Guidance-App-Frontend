import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { Site } from '../models/site';

@Component({
  selector: 'app-my-sites',
  templateUrl: './my-sites.component.html',
  styleUrls: ['./my-sites.component.scss']
})
export class MySitesComponent implements OnInit {

  pageNumber = 1;
  totalPages = 0;
  sitesPerPage = 10;

  updateFilter($event: Event) {
    const filter = ($event.target as HTMLInputElement).value;
    let newSites = this.allSites.filter((site) => {
      return site.siteName?.toLowerCase().includes(filter.toLowerCase()) || site.siteDescription?.toLowerCase().includes(filter.toLowerCase()) || site.siteWebsite?.toLowerCase().includes(filter.toLowerCase());
    });
    this.updatePageNumbers(newSites);
    this.sites = newSites;
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

  allSites: Site[] = [];
  sites: Site[] = [];

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) {
    this.http.get<String>(this.baseUrl + 'sites/').subscribe(
      (result: any) => {
        let parsedSites: Site[] = [];
        for (let site of result) {
          parsedSites.push(Site.parseObject(site));
        }
        this.allSites = parsedSites;
        this.sites = parsedSites;
        this.updatePageNumbers(parsedSites);
      },
      (error) => console.error(error)
    );

   }

  ngOnInit(): void {
  }

  updatePageNumbers(newSites: Site[]) {
    let totalPageAmount = Math.ceil(newSites.length / this.sitesPerPage);
    if (totalPageAmount < this.pageNumber) {
      this.pageNumber = totalPageAmount;
    }
    if (this.pageNumber < 1 && totalPageAmount > 0){
      this.pageNumber = 1;
    }
    this.totalPages = totalPageAmount;
  }


}
