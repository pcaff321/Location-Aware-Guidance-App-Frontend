import { SiteMap } from './siteMap';
import { Globals } from "../services/globals";

export class Hint {
    static hintCache: Hint[] = [];

    id: number;
    _name?: string;
    hintText: string;
    hintImage?: string = '';
    contentType?: string = 'image/png';
    x: number;
    y: number;
    map: SiteMap;
    fakeId = Globals.getFakeId();

    constructor(id: number, hintText: string, map: SiteMap, x: number = 0, y: number = 0) {
        this.id = id;
        this.hintText = hintText;
        this.map = map;
        this.x = x;
        this.y = y;
        if (this.id <= 0) {
            this.id = Globals.getFakeId() * -1;
        }
        if (!Hint.hintCache.includes(this)) {
            Hint.hintCache.push(this);
        }
    }

    static parseObject(resultJson: any): Hint {
        let result = {} as any;
        Object.keys(resultJson).forEach((key) => {
            result[key.toLowerCase()] = resultJson[key];
        });
        let newHint = Hint.hintCache.find((hint) => hint.id == result['id']);
        let map = SiteMap.siteMapCache.find((map) => map.mapId == result['mapid']);
        if (map == null || map == undefined) {
            map = SiteMap.parseObject(result['map']);
        }
        if (newHint == null || newHint == undefined) {
            newHint = new Hint(result['id'], result['hinttext'], map!);
            Hint.hintCache.push(newHint);
        } else {
            newHint.map = map!;
        }
        newHint.name = result['name'];
        newHint.hintImage = result['hintimage'];
        newHint.contentType = result['contenttype'];
        newHint.x = result['x'];
        newHint.y = result['y'];
        return newHint;
    }

    toJson(): any {
        return {
            id: this.id,
            name: this.name,
            hintText: this.hintText,
            hintImage: this.hintImage,
            contentType: this.contentType,
            x: this.x,
            y: this.y,
            mapId: this.map.mapId,
            hintFakeId: this.fakeId,
            mapFakeId: this.map.fakeId
        };
    }


    get src() {
        return "data:" + this.contentType + ";base64," + this.hintImage;
    }

    get name() {
        if (this._name == null || this._name == undefined || this._name == "") {
            return "Hint " + this.fakeId;
        }
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

}
