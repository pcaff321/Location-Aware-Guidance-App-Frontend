import { HttpService } from './../services/httpService';
import { Component, OnInit } from '@angular/core';
import { NetworkDevice } from '../models/networkDevice';

@Component({
  selector: 'app-my-network-devices',
  templateUrl: './my-network-devices.component.html',
  styleUrls: ['./my-network-devices.component.scss'],
})
export class MyNetworkDevicesComponent implements OnInit {
  updateFilter($event: Event) {
    const filter = ($event.target as HTMLInputElement).value;
    let newDevices = this.allDevices.filter((device) => {
      return device.deviceName?.toLowerCase().includes(filter.toLowerCase()) || device.deviceMAC?.toLowerCase().includes(filter.toLowerCase());
    });
    this.updatePageNumbers(newDevices);
    this.networkDevices = newDevices;
}

pageNumber = 1;
totalPages = 0;
devicesPerPage = 5;
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

  allDevices: NetworkDevice[] = [];
  networkDevices: NetworkDevice[] = [];

  constructor(private httpService: HttpService) {
    httpService.getNetworkDevices().then((devices) => {
      devices.subscribe((devices) => {
        this.allDevices = devices;
        this.networkDevices = devices;
        this.updatePageNumbers(devices);
    });
  });
  }

  ngOnInit(): void {}

  updatePageNumbers(newMaps: NetworkDevice[]) {
    let totalPageAmount = Math.ceil(newMaps.length / this.devicesPerPage);
    if (totalPageAmount < this.pageNumber) {
      this.pageNumber = totalPageAmount;
    }
    if (this.pageNumber < 1 && totalPageAmount > 0){
      this.pageNumber = 1;
    }
    this.totalPages = totalPageAmount;
  }
}
