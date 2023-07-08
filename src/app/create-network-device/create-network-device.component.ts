import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NetworkDevice } from '../models/networkDevice';
import { HttpService } from '../services/httpService';

@Component({
  selector: 'app-create-network-device',
  templateUrl: './create-network-device.component.html',
  styleUrls: ['./create-network-device.component.scss'],
})
export class CreateNetworkDeviceComponent implements OnInit {
  updateIsBluetooth($event: Event) {
    this.isBluetooth = ($event.target as HTMLInputElement).checked;
  }
  updateIsPublic($event: Event) {
    this.isPublic = ($event.target as HTMLInputElement).checked;
  }
  updateDeviceUUIDs($event: Event) {
    this.deviceUUIDs = ($event.target as HTMLInputElement).value;
  }
  updateDeviceMAC($event: Event) {
    this.deviceMAC = ($event.target as HTMLInputElement).value;
  }
  updateDeviceName($event: Event) {
    this.deviceName = ($event.target as HTMLInputElement).value;
  }

  @ViewChild('deviceName') deviceNameElem: any;
  @ViewChild('deviceMAC') deviceMACElem: any;
  @ViewChild('deviceUUIDs') deviceUUIDsElem: any;
  @ViewChild('isPublic') isPublicElem: any;
  @ViewChild('isBluetooth') isBluetoothElem: any;

  private deviceName?: string | null;
  private deviceMAC?: string | null;
  private deviceUUIDs?: string | null;
  private isPublic: boolean = false;
  private isBluetooth: boolean = false;
  public deviceId?: string | null;

  constructor(
    private httpService: HttpService,
    private http: HttpClient,
    private route: ActivatedRoute,
    @Inject('BASE_URL') private baseUrl: string,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      let lowerParams = new Map();
      params.keys.forEach((key) => {
        lowerParams.set(key.toLowerCase(), params.get(key));
      });
      this.deviceId = lowerParams.get('id') || undefined;
    });
    if (this.deviceId) {
    this.http.get<String>(this.baseUrl + 'networkdevices/' + this.deviceId!).subscribe(
      (result: any) => {
        let newSite = NetworkDevice.parseObject(result);
        this.deviceName = newSite.deviceName;
        this.deviceMAC = newSite.deviceMAC;
        this.deviceUUIDs = newSite.deviceUUIDs;
        this.isPublic = newSite.isPublic || false;
        this.isBluetooth = newSite.isBluetooth || false;

        this.updateView();
      },
      (error: any) => console.error(error)
    );
    }
  }
  updateView() {
    this.deviceNameElem.nativeElement.value = this.deviceName;
    this.deviceMACElem.nativeElement.value = this.deviceMAC;
    this.deviceUUIDsElem.nativeElement.value = this.deviceUUIDs;
    this.isPublicElem.nativeElement.checked = this.isPublic;
    this.isBluetoothElem.nativeElement.checked = this.isBluetooth;
  }

  submitForm($event: Event) {
    $event.preventDefault();
    if (!this.deviceName || !this.deviceMAC) {
      return false;
    }
    let device = new NetworkDevice(null, this.deviceName!, this.deviceMAC!);
    device.deviceUUIDs = this.deviceUUIDs;
    device.isPublic = this.isPublic;
    device.isBluetooth = this.isBluetooth;
    if (this.deviceId) {
      device.id = this.deviceId;
    }
    this.httpService
      .submitForm(JSON.stringify(device), this.baseUrl + 'networkdevices')
      .subscribe((result: any) => {
        this.router.navigate(['/my-devices'], {
          queryParams: { deviceId: result.id },
        });
      });
    return false;
  }
}
