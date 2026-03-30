import { Section } from './Section';

export class Horizon {
  constructor(
    public id: number,
    public guid: string,
    public name: string,
    public altitude: number,
    public isMine: boolean,
    public objectId: string,
    public sections: Section[] 
  ) {}
}