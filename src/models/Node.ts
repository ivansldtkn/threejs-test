import { Vector3 } from "three";

export class Node {
    constructor(
      public id: number,
      public guid: string,
      public x: number,
      public y: number,
      public z: number
    ) {}
  
    toVector3(): Vector3 {
      return new Vector3(this.x, this.y, this.z);
    }
  }