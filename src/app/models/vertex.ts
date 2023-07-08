import { Globals } from './../services/globals';
import { Edge } from './edge';
export class Vertex {
    static vertexCache: Vertex[] = [];

    static parseObject(resultJson: any): Vertex {
        let result = {} as any;
        Object.keys(resultJson).forEach((key) => {
            result[key.toLowerCase()] = resultJson[key];
        });
        if (result['id'] == null || result['id'] == undefined || result['id'] == '' || parseInt(result['id']) < 1) {
            result['id'] = (Globals.getFakeId() * -1).toString();
        }   
        let newVertex = Vertex.vertexCache.find((vertex) => vertex.id == result['id']);
        if (newVertex == null || newVertex == undefined) {
            newVertex = new Vertex(result['id'], result['vertexName'], result['x'], result['y']);
            if (newVertex.id == null || newVertex.id == undefined || newVertex.id == '' 
             || parseInt(newVertex.id) < 1){
                newVertex.id = (newVertex.fakeId * -1).toString();
            }
            newVertex.vertexName = result['vertexname'];
            Vertex.vertexCache.push(newVertex);
        } else {
            newVertex.x = result['x'];
            newVertex.y = result['y'];
            newVertex.vertexName = result['vertexname'];
        }
        return newVertex;
    }

    id: string;
    x: number;
    y: number;
    _vertexName?: string;
    fakeId: number;
    edges : Vertex[] = [];
    doorType = 0;

    get vertexName(): string {
        if (this._vertexName == null || this._vertexName == undefined) {
            return "Vertex" + this.id;
        }
        return this._vertexName;
    }

    set vertexName(value: string) {
        if (value == null || value == undefined) {
            value = "Vertex" + this.id;
        }
        this._vertexName = value;
    }

    addEdge(vertex: Vertex) {
        if (Vertex.vertexCache.find((vertex) => vertex.id == this.id || vertex.fakeId == this.fakeId) == null) {
            Vertex.vertexCache.push(this);
        }
        if (vertex == null || vertex == undefined) {
            return;
        }
        if (!this.edges.includes(vertex)) {
            this.edges.push(vertex);
        }
       // newEdge = new Edge(result['id'], Vertex.parseObject(result['vertexa']), Vertex.parseObject(result['vertexb']));
        let edgeAsJson = { id: null, vertexAid: this.id, vertexBid: vertex.id
            , vertexAfakeId: this.fakeId, vertexBfakeId: vertex.fakeId};
        return Edge.parseObject(edgeAsJson);
    }

    constructor(id: string, vertexName: string, x: number, y: number) {
        this.fakeId = Globals.getFakeId();
        if (id == null || id == undefined || id == '' || parseInt(id) < 1) {
            id = (this.fakeId * -1).toString();
        }
        this.id = id;
        this.vertexName = vertexName;
        this.x = x;
        this.y = y;
        if (Vertex.vertexCache.find((vertex) => vertex.id == this.id || vertex.fakeId == this.fakeId) == null) {
            Vertex.vertexCache.push(this);
        }
    }

    toJson() {
        return {
            id: this.id,
            vertexName: this.vertexName,
            x: this.x,
            y: this.y,
            fakeId: this.fakeId
        }
    }
}