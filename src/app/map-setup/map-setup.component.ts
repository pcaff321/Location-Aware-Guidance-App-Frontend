import { Globals } from './../services/globals';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SiteMap } from '../models/siteMap';
import { ActiveService } from '../services/activeService';
import { HttpService } from '../services/httpService';

@Component({
  selector: 'app-map-setup',
  templateUrl: './map-setup.component.html',
  styleUrls: ['./map-setup.component.scss'],
})
export class MapSetupComponent implements OnInit {

  async updateMapImageInfo() {
    if (this.mapImage) {
      this._imageSrc = await this.toBase64(this.mapImage);
      this._content = this.mapImage!.type;
    }
  }

  updateMapImage($event: Event) {
    this.mapImage = ($event.target as HTMLInputElement).files![0];
    this.updateMapImageInfo();
  }
  updateMapName($event: Event) {
    this.mapName = ($event.target as HTMLInputElement).value;
  }
  mapName?: string | null;
  mapImage?: File | null;


  @ViewChild('mapName') mapNameElem: any;

  public mapId?: string | null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private activeService: ActiveService,
    private httpService: HttpService,
    @Inject('BASE_URL') private baseUrl: string,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      let lowerParams = new Map();
      params.keys.forEach((key) => {
        lowerParams.set(key.toLowerCase(), params.get(key));
      });
      this.mapId = lowerParams.get('id') || undefined;
    });
    if (this.mapId) {
    this.http.get<String>(this.baseUrl + 'maps/' + this.mapId!).subscribe(
      (result: any) => {
        let newMap = SiteMap.parseObject(result);
        this.mapName = newMap.mapName;

        this.updateView();
      },
      (error: any) => console.error(error)
    );
    }
  }

  updateView() {
    this.mapNameElem.nativeElement.value = this.mapName;
  }

  _imageSrc: string | undefined | unknown;
  _content: string | undefined;

  imageSrc(): string {
    let typeOfImageSrc = typeof this._imageSrc;
    if (this._imageSrc && this._content && typeOfImageSrc === 'string') {
      return "data:" + this._content + ";base64," + this._imageSrc;
    }
    return '';
  }

  async submitForm(event: any) {
    if (this.mapImage == null) {
      return;
    }
    event.preventDefault();
    let map = {
      id: "0",
      mapName: this.mapName,
      contentType: this.mapImage!.type,
      mapImage: await this.toBase64(this.mapImage),
      adminPassword: this.httpService.adminPassword,
    };
    if (this.mapId) {
      map['id'] = this.mapId!;
    }

    this.http.post(this.baseUrl + 'maps/', map).subscribe(
      (data) => {
        let newMap = SiteMap.parseObject(data);
        this.activeService.setActiveMap(newMap);
        this.router.navigate(['/my-maps'], {
          queryParams: { mapId: data },
        });
      },
      (error) => console.log(error)
    );
  }

  toBase64 = (file: Blob | null | undefined) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file!);
      reader.onload = () => resolve(reader.result!.toString().split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
}
