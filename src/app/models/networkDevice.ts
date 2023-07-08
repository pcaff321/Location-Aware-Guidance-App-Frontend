import { Globals } from './../services/globals';
import { Beacon } from './beacon';

export class NetworkDevice {
  static networkDeviceCache: NetworkDevice[] = [];

  static parseObject(resultJson: any): NetworkDevice {
    let result = {} as any;
    Object.keys(resultJson).forEach((key) => {
      result[key.toLowerCase()] = resultJson[key];
    });
    let newDevice = NetworkDevice.networkDeviceCache.find((device) => device.id == result['id']);
    if (newDevice == null || newDevice == undefined) {
      newDevice = new NetworkDevice(
        result['id'],
        result['devicename'],
        result['devicemac']
      );
    }
    newDevice.deviceName = result['devicename'];
    newDevice.deviceMAC = result['devicemac'];
    newDevice.deviceUUIDs = result['deviceuuids'];
    newDevice.isPublic = result['ispublic'];
    newDevice.isBluetooth = result['isbluetooth'];
    if (NetworkDevice.networkDeviceCache.find((device) => device.id == result['id']) == null) {
      NetworkDevice.networkDeviceCache.push(newDevice);
    }
    return newDevice;
  }
  id!: string | null;
  deviceName!: string | null;
  deviceMAC!: string | null;
  deviceUUIDs?: string | null;
  isPublic?: boolean | null;
  isBluetooth?: boolean | null;
  fakeId = Globals.getFakeId();

  constructor(
    id: string | null,
    deviceName: string | null,
    deviceMAC: string | null
  ) {
    this.id = id;
    this.deviceName = deviceName;
    this.deviceMAC = deviceMAC;
  }

  get link() {
    return "/manage-device?id=" + this.id;
}
}
