import { Vector3 } from "three";
import { Node } from './Node';
import { Section } from './Section';
import { Excavation } from './Excavation';
import { Horizon } from './Horizon';

export class MineGraph {
  private nodesMap: Map<number, Node>;
  private sectionsMap: Map<number, Section>;
  private excavationsMap: Map<number, Excavation>;
  private horizonsMap: Map<number, Horizon>;
  private horizonsList: Horizon[];

  constructor(
    nodesMap: Map<number, Node>,
    sectionsMap: Map<number, Section>,
    excavationsMap: Map<number, Excavation>,
    horizons: Horizon[]
  ) {
    this.nodesMap = nodesMap;
    this.sectionsMap = sectionsMap;
    this.excavationsMap = excavationsMap;
    
    this.horizonsMap = new Map();
    horizons.forEach(horizon => {
      this.horizonsMap.set(horizon.id, horizon);
    });
    
    this.horizonsList = horizons;
  }

  getAllExcavations(): Excavation[] {
    return Array.from(this.excavationsMap.values());
  }

  getAllHorizons(): Horizon[] {
    return [...this.horizonsList];
  }

  /**
   * Получить все выработки, принадлежащие горизонту
   * (Выработка может пересекать несколько горизонтов, так как содержит секции из разных горизонтов)
   */
  getExcavationsByHorizon(horizonId: number): Excavation[] {
    const horizon = this.horizonsMap.get(horizonId);
    if (!horizon) return [];
    
    const horizonSectionIds = new Set(horizon.sections.map(s => s.id));
    
    return this.getAllExcavations().filter(ext => 
      ext.sections.some(s => horizonSectionIds.has(s.id))
    );
  }

  /**
   * Получить видимые секции для конкретного горизонта
   */
  getVisibleSectionsByHorizon(horizonId: number): Section[] {
    const horizon = this.horizonsMap.get(horizonId);
    if (!horizon) return [];
    
    const horizonSectionIds = new Set(horizon.sections.map(s => s.id));
    const visibleSections: Section[] = [];
    
    this.excavationsMap.forEach(ext => {
      if (ext.visible) {
        ext.sections.forEach(section => {
          if (horizonSectionIds.has(section.id)) {
            visibleSections.push(section);
          }
        });
      }
    });
    
    return visibleSections;
  }

  getBoundingBox(): {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
  } {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    
    this.nodesMap.forEach(node => {
      minX = Math.min(minX, node.x);
      maxX = Math.max(maxX, node.x);
      minY = Math.min(minY, node.y);
      maxY = Math.max(maxY, node.y);
      minZ = Math.min(minZ, node.z);
      maxZ = Math.max(maxZ, node.z);
    });
    
    return { minX, maxX, minY, maxY, minZ, maxZ };
  }

  getCenter(): Vector3 {
    const box = this.getBoundingBox();
    return new Vector3(
      (box.minX + box.maxX) / 2,
      (box.minY + box.maxY) / 2,
      (box.minZ + box.maxZ) / 2
    );
  }

  getOptimalCameraDistance(): number {
    const box = this.getBoundingBox();
    const width = box.maxX - box.minX;
    const height = box.maxY - box.minY;
    const depth = box.maxZ - box.minZ;
    return Math.max(width, height, depth) * 1.2;
  }

  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Проверяем, что все узлы в секциях существуют
    this.sectionsMap.forEach(section => {
      if (!this.nodesMap.has(section.startNode.id)) {
        errors.push(`Section ${section.id}: start node ${section.startNode.id} not found`);
      }
      if (!this.nodesMap.has(section.endNode.id)) {
        errors.push(`Section ${section.id}: end node ${section.endNode.id} not found`);
      }
    });
    
    // Проверяем, что все секции в выработках существуют
    this.excavationsMap.forEach(ext => {
      ext.sections.forEach(section => {
        if (!this.sectionsMap.has(section.id)) {
          errors.push(`Excavation ${ext.id}: section ${section.id} not found`);
        }
      });
    });
    
    // Проверяем, что все секции в горизонтах существуют
    this.horizonsList.forEach(horizon => {
      horizon.sections.forEach(section => {
        if (!this.sectionsMap.has(section.id)) {
          errors.push(`Horizon ${horizon.id}: section ${section.id} not found`);
        }
      });
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}