import { Section } from './Section';
import { makeAutoObservable } from 'mobx';

export class Excavation {
  public visible: boolean = true;
  public color: string;

  constructor(
    public id: number,
    public guid: string,
    public name: string,
    public objectId: string,
    public excavationType: string,
    public sections: Section[]
  ) {
    makeAutoObservable(this);
    this.color = this.generateColor();
  }

  private generateColor(): string {
    // Используем золотое сечение для равномерного распределения
    const goldenRatio = 0.618033988749895;
    const hue = (this.id * goldenRatio * 360) % 360;
    
    return `hsl(${hue}, 80%, 55%)`;
  }

  toggleVisibility(): void {
    this.visible = !this.visible;
  }
}
