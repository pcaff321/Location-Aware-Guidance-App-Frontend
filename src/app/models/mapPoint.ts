import { Beacon } from './beacon';
import { NetworkDevice } from './networkDevice';
import { SiteMap } from './siteMap';

export class MapPoint {
  static mapPointCache: MapPoint[] = [];

  static parseObject(resultJson: any): MapPoint {
    let result = {} as any;
    Object.keys(resultJson).forEach((key) => {
      result[key.toLowerCase()] = resultJson[key];
    });
    let newMapPoint = MapPoint.mapPointCache.find(
      (mapPoint) => mapPoint.id == result['id']
    );
    if (newMapPoint == null || newMapPoint == undefined) {
      newMapPoint = new MapPoint(
        result['id'],
        NetworkDevice.parseObject(result['networkdevice']),
        SiteMap.parseObject(result['map'])
      );
    }
    newMapPoint.networkDevice = NetworkDevice.parseObject(result['networkdevice']);
    newMapPoint.range = result['range'];
    newMapPoint.x = result['x'];
    newMapPoint.y = result['y'];
    if (MapPoint.mapPointCache.find((mapPoint) => mapPoint.id == result['id']) == null) {
      MapPoint.mapPointCache.push(newMapPoint);
    }
    return newMapPoint;
  }

  id: number | null;
  networkDevice: NetworkDevice | null;
  map: SiteMap | null;
  range?: number | null;
  x?: number | null;
  y?: number | null;
  _name? : string | null;

  set name(name: string | null){
    this._name = name;
  }

  get name(){
    if (this._name == null || this._name == undefined || this._name == ''){
      let beaconType = this.networkDevice?.isBluetooth ? 'Bluetooth' : 'WiFi';
      return `Beacon ${this.id}`;
    }
      return this._name;
    }

  constructor(
    id: number | null,
    networkDevice: NetworkDevice | null,
    map: SiteMap | null
  ) {
    this.id = id;
    this.networkDevice = networkDevice;
    this.map = map;
  }

  get beacon(){
    let beaconDataToParse = {
        beaconName: this.name,
        uuids: this.networkDevice?.deviceUUIDs,
        macAddress: this.networkDevice?.deviceMAC,
        locationX: this.x,
        locationY: this.y,
        range: this.range,
        networkDeviceId: this.networkDevice?.id,
        sectionId: this.map?.mapId
    }
    return Beacon.parseObject(beaconDataToParse);
  }

}
