import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Site } from '../models/site';

@Component({
  selector: 'app-site-page',
  templateUrl: './site-page.component.html',
  styleUrls: ['./site-page.component.scss'],
})
export class SitePageComponent implements OnInit, AfterViewInit {
  private siteId?: string;
  private _site?: Site;
  get site(): Site | undefined {
    return this._site;
  }

  @ViewChild('siteName') siteNameElem: ElementRef | undefined;


  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    @Inject('BASE_URL') private baseUrl: string
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      let lowerParams = new Map();
      params.keys.forEach((key) => {
        lowerParams.set(key.toLowerCase(), params.get(key));
      });
      this.siteId = lowerParams.get('siteid') || '';
    });
    this.http.get<String>(this.baseUrl + 'sites/' + this.siteId!).subscribe(
      (result: any) => {
        let newSite = Site.parseObject(result);
        this._site = newSite;

        this.updateView();
      },
      (error) => console.error(error)
    );
  }

  ngAfterViewInit(): void {
    this.updateView();
  }

  updateView(): void {
    if (!this.siteNameElem || !this.site) {
      return;
    }
    this.siteNameElem!.nativeElement.innerHTML = this.site?.siteName;
  }
}
