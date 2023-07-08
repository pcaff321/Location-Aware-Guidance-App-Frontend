import { Globals } from "../services/globals";
import { Beacon } from "./beacon";
import { NetworkDevice } from "./networkDevice";

export class SiteMap {
    static siteMapCache : SiteMap[] = [];

outerMap: any;

    static parseObject(resultJson: any): SiteMap {
        let result = {} as any;
        Object.keys(resultJson).forEach((key) => {
            result[key.toLowerCase()] = resultJson[key];
        });
        let newMap = SiteMap.siteMapCache.find((map) => map.mapId == result['id']);
        if (newMap == null || newMap == undefined) {
            newMap = new SiteMap(result['id'], result['mapname'], result['user']);
        }
        newMap.mapName = result['mapname'];
        newMap.user = result['user'];
        newMap.mapImage = result['mapimage'];
        newMap.contentType = result['contenttype'];
        newMap.sizingLocation1X = result['sizinglocation1x'];
        newMap.sizingLocation1Y = result['sizinglocation1y'];
        newMap.sizingLocation2X = result['sizinglocation2x'];
        newMap.sizingLocation2Y = result['sizinglocation2y'];
        newMap.metresBetweenPoints = result['metresbetweenpoints'];
        if (SiteMap.siteMapCache.find((map) => map.mapId == result['id']) == null) {
            SiteMap.siteMapCache.push(newMap);
        }

        return newMap;
    }

    mapId: string | null;
    mapName: string | null;
    user: string | null;
    mapImage?: string = '';
    contentType?: string = 'image/png';
    sizingLocation1X: number = 0;
    sizingLocation1Y: number = 0;
    sizingLocation2X: number = 50;
    sizingLocation2Y: number = 50;
    metresBetweenPoints: number = 0;
    beacons : Beacon[] = [];
    fakeId = Globals.getFakeId();

    constructor(id: string | null, mapName: string | null, user: string | null) {
        this.mapId = id;
        this.mapName = mapName;
        this.user = user;
        if (this.mapId == null || this.mapId == undefined || this.mapId == '' || this.mapId == '0' ) {
            this.mapId = (this.fakeId * -1).toString();
        }
    }

    get src() {
        return "data:" + this.contentType + ";base64," + this.mapImage;
    }

    get link(): string {
      return 'create-map?id=' + this.mapId;
    }


    get lengthBetweenPoints() {
        let xDiff = this.sizingLocation1X - this.sizingLocation2X;
        let yDiff = this.sizingLocation1Y - this.sizingLocation2Y;
        return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
    }

    get metresPerPixel() {
        return this.metresBetweenPoints / this.lengthBetweenPoints;
    }

    toJson() {
        return {
            id: this.mapId,
            mapName: this.mapName,
            user: this.user,
            sizingLocation1X: this.sizingLocation1X,
            sizingLocation1Y: this.sizingLocation1Y,
            sizingLocation2X: this.sizingLocation2X,
            sizingLocation2Y: this.sizingLocation2Y,
            metresBetweenPoints: this.metresBetweenPoints,
        }
    }

  }
