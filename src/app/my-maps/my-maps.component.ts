import { SiteMap } from './../models/siteMap';
import { Component, OnInit, enableProdMode } from '@angular/core';
import { HttpService } from '../services/httpService';

@Component({
  selector: 'app-my-maps',
  templateUrl: './my-maps.component.html',
  styleUrls: ['./my-maps.component.scss'],
})
export class MyMapsComponent implements OnInit {
updateFilter($event: Event) {
    const filter = ($event.target as HTMLInputElement).value;
    let newMaps = this.allMaps.filter((map) => {
      return map.mapName?.toLowerCase().includes(filter.toLowerCase());
    });
    this.updatePageNumbers(newMaps);
    this.maps = newMaps;
}
  pageNumber = 1;
  totalPages = 0;
  mapsPerPage = 5;
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
  allMaps: SiteMap[] = [];
  maps: SiteMap[] = [];

  constructor(private httpService: HttpService) {
    httpService.getMaps().then((maps) => {
      maps.subscribe((maps: SiteMap[]) => {
        this.maps = maps;
        this.allMaps = maps;
        this.updatePageNumbers(maps);
      });
    });
  }

  ngOnInit(): void {}

  updatePageNumbers(newMaps: SiteMap[]) {
    let totalPageAmount = Math.ceil(newMaps.length / this.mapsPerPage);
    if (totalPageAmount < this.pageNumber) {
      this.pageNumber = totalPageAmount;
    }
    if (this.pageNumber < 1 && totalPageAmount > 0){
      this.pageNumber = 1;
    }
    this.totalPages = totalPageAmount;
  }
}
