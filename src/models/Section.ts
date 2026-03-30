import { Vector3 } from "three";
import { Node } from './Node';

export class Section {
  constructor(
    public id: number,
    public guid: string,
    public startNode: Node,
    public endNode: Node,
    public thickness: number
  ) {}

  getStartPoint(): Vector3 {
    return this.startNode.toVector3();
  }

  getEndPoint(): Vector3 {
    return this.endNode.toVector3();
  }
}
