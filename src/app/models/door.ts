import { Globals } from './../services/globals';
import { Section } from "./section";
import { Vertex } from "./vertex";

export class Door {
    static doorCache: Door[] = [];

    id: number;
    doorType: number = 3;
    vertex: Vertex;
    section: Section;
    fakeId = Globals.getFakeId();

    constructor(id: number, vertex: Vertex, section: Section) {
        this.id = id;
        this.vertex = vertex;
        this.section = section;
        if (this.id <= 0) {
            this.id = Globals.getFakeId() * -1;
        }
    }

    static parseObject(resultJson: any): Door {
        let result = {} as any;
        Object.keys(resultJson).forEach((key) => {
            result[key.toLowerCase()] = resultJson[key];
        });
        let newDoor = Door.doorCache.find((door) => door.id == result['id']);
        let vertex = Vertex.vertexCache.find((vertex) => vertex.id == result['vertexid']);
        let section = Section.sectionCache.find((section) => section.id == result['sectionid']);
        if (vertex == null || vertex == undefined) {
            vertex = Vertex.parseObject(result['vertex']);
        }
        if (section == null || section == undefined) {
            section = Section.parseObject(result['section']);
        }
        if (newDoor == null || newDoor == undefined) {
            newDoor = new Door(result['id'], vertex, section!);
            Door.doorCache.push(newDoor);
        } else {
            newDoor.vertex = vertex;
            newDoor.section = section!;
        }
        newDoor.doorType = result['doortype'];
        return newDoor;
    }

    get name (): string {
        return this.vertex.vertexName;
    }

    isDoor(): boolean {
        return !this.isExit();
    }

    isExit(): boolean {
        return this.doorType == 2;
    }

    toJson(): any {
        return {
            id: this.id,
            vertexId: this.vertex.id,
            sectionId: this.section.id,
            doorType: this.doorType,
            doorFakeId: this.fakeId,
            vertexFakeId: this.vertex.fakeId,
            sectionFakeId: this.section.fakeId
        }
    }
}
