import { Globals } from '../services/globals';
import { NetworkDevice } from './networkDevice';
export class Beacon {
    static beaconCache: Beacon[] = [];

    sectionId?: string;

    static parseObject(resultJson: any): Beacon {
        let result = {} as any;
        Object.keys(resultJson).forEach((key) => {
            result[key.toLowerCase()] = resultJson[key];
        });
        let beaconName = result['beaconname'];
        let uuids = result['uuids'];
        let locationX = result['locationx'];
        let locationY = result['locationy'];
        let range = result['range'];
        let networkDeviceId = result['networkdeviceid'];
        let macAddress = result['macaddress'];
        let sectionId = result['sectionid'];
        let newBeacon = Beacon.beaconCache.find((beacon) => (beacon.macAddress == macAddress));
        if (newBeacon == null || newBeacon == undefined || (networkDeviceId != null && newBeacon.networkDeviceId != null && networkDeviceId != newBeacon.networkDeviceId) || (sectionId != null && sectionId != undefined && sectionId != newBeacon.sectionId)) {
            newBeacon = new Beacon(beaconName, uuids, locationX, locationY, range);
        } else {
          console.warn('Beacon already exists');
        }

        newBeacon.networkDeviceId = networkDeviceId;
        newBeacon.macAddress = macAddress;
        if (Beacon.beaconCache.find((beacon) => beacon.uuids == uuids) == null) {
            Beacon.beaconCache.push(newBeacon);
        }
        return newBeacon;
    }


    beaconName?: string;
    uuids?: string;
    locationX?: number;
    locationY?: number;
    range?: number;
    networkDeviceId?: string = '';
    macAddress?: string = 'NONE';
    fakeId = Globals.getFakeId();

    constructor(beaconName?: string, uuids?: string, locationX?: number, locationY?: number, range?: number) {
        this.beaconName = beaconName;
        this.uuids = uuids;
        this.locationX = locationX;
        this.locationY = locationY;
        this.range = range || 200;
    }
  }
