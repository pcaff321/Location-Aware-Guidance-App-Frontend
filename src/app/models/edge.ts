import { Globals } from '../services/globals';
import { Section } from './section';
import { Vertex } from './vertex';

export class Edge {
  static edgeCache: Edge[] = [];

  static parseObject(resultJson: any): Edge {
    let result = {} as any;
    Object.keys(resultJson).forEach((key) => {
      result[key.toLowerCase()] = resultJson[key];
    });
    if (result['vertexafakeid'] == null) {
      result['vertexafakeid'] = 0;
    }
    if (result['vertexbfakeid'] == null) {
      result['vertexbfakeid'] = 0;
    }
    let newEdge =
      Edge.edgeCache.find((edge) => edge.id == result['id']) ||
      Edge.edgeCache.find(
        (edge) =>
          (edge.vertexA.id == result['vertexaid'] &&
            edge.vertexB.id == result['vertexbid']) ||
          (edge.vertexA.fakeId == result['vertexafakeid'] &&
            edge.vertexB.fakeId == result['vertexbfakeid'])
      );
    let vertexA = Vertex.vertexCache.find(
      (vertex) =>
        vertex.id == result['vertexaid'] ||
        vertex.fakeId == result['vertexafakeid']
    );
    let vertexB = Vertex.vertexCache.find(
      (vertex) =>
        vertex.id == result['vertexbid'] ||
        vertex.fakeId == result['vertexbfakeid']
    );
    if (vertexA == null || vertexA == undefined) {
      vertexA = Vertex.parseObject(result['vertexa']);
    }
    if (vertexB == null || vertexB == undefined) {
      vertexB = Vertex.parseObject(result['vertexb']);
    }
    if (vertexA == vertexB) {
      throw new Error('Vertex A and Vertex B are the same');
    }
    if (newEdge == null || newEdge == undefined) {
      newEdge = new Edge(result['id'], vertexA, vertexB);
      Edge.edgeCache.push(newEdge);
    } else {
      newEdge.vertexA = vertexA;
      newEdge.vertexB = vertexB;
    }
    return newEdge;
  }

  id: number;
  vertexA: Vertex;
  vertexB: Vertex;
  fakeId: number;

  constructor(id: number, vertexA: Vertex, vertexB: Vertex) {
    this.fakeId = Globals.getFakeId();
    if (vertexA == vertexB) {
      throw new Error('Vertex A and Vertex B are the same');
    }
    if (id == null || id == undefined || id == 0 || id.toString() == '0') {
      id = Globals.getFakeId() * -1;
    }
    this.id = id;
    this.vertexA = vertexA;
    this.vertexB = vertexB;
    if (Edge.edgeCache.find((edge) => edge.id == this.id) == null) {
      Edge.edgeCache.push(this);
    } else {
        let existingEdge = Edge.edgeCache.find((edge) => edge.id == this.id);
        existingEdge!.vertexA = this.vertexA;
        existingEdge!.vertexB = this.vertexB;  
        return existingEdge!;
    }
  }

  toJson() {
    return {
      id: this.id,
      vertexAid: this.vertexA.id,
      vertexBid: this.vertexB.id,
      vertexAfakeId: this.vertexA.fakeId,
      vertexBfakeId: this.vertexB.fakeId,
      fakeId: this.fakeId,
    };
  }
}
