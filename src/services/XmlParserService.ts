import { Node } from '../models/Node';
import { Section } from '../models/Section';
import { Excavation } from '../models/Excavation';
import { Horizon } from '../models/Horizon';
import { MineGraph } from '../models/MineGraph';

export class XmlParserService {
  
  async parseXmlFile(file: File): Promise<any> {
    const text = await this.readFileWithEncoding(file);
    return this.parseXmlString(text);
  }

  private readFileWithEncoding(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const decoder = new TextDecoder('windows-1251');
        const text = decoder.decode(arrayBuffer);
        resolve(text);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  private parseXmlString(xmlString: string): any {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    
    // Проверяем на ошибки парсинга
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error('XML parsing error: ' + parserError.textContent);
    }
    
    return this.xmlDocToJson(xmlDoc);
  }

  private xmlDocToJson(xmlDoc: Document): any {
    const result: any = {};
    
    // Парсим Nodes
    const nodesElement = xmlDoc.querySelector('Nodes');
    if (nodesElement) {
      result.Nodes = { Node: [] };
      const nodeElements = nodesElement.querySelectorAll('Node');
      nodeElements.forEach(nodeEl => {
        const node = {
          Id: [this.getTextContent(nodeEl, 'Id')],
          Guid: [this.getTextContent(nodeEl, 'Guid')],
          X: [this.getTextContent(nodeEl, 'X')],
          Y: [this.getTextContent(nodeEl, 'Y')],
          Z: [this.getTextContent(nodeEl, 'Z')]
        };
        result.Nodes.Node.push(node);
      });
    }
    
    // Парсим Sections
    const sectionsElement = xmlDoc.querySelector('Sections');
    if (sectionsElement) {
      result.Sections = { Section: [] };
      const sectionElements = sectionsElement.querySelectorAll('Section');
      sectionElements.forEach(sectionEl => {
        const section = {
          Id: [this.getTextContent(sectionEl, 'Id')],
          Guid: [this.getTextContent(sectionEl, 'Guid')],
          StartNodeId: [this.getTextContent(sectionEl, 'StartNodeId')],
          EndNodeId: [this.getTextContent(sectionEl, 'EndNodeId')],
          Thickness: [this.getTextContent(sectionEl, 'Thickness')]
        };
        result.Sections.Section.push(section);
      });
    }
    
    // Парсим Excavations
    const excavationsElement = xmlDoc.querySelector('Excavations');
    if (excavationsElement) {
      result.Excavations = { Excavation: [] };
      const excavationElements = excavationsElement.querySelectorAll('Excavation');
      excavationElements.forEach(extEl => {
        const excavation = {
          Id: [this.getTextContent(extEl, 'Id')],
          Guid: [this.getTextContent(extEl, 'Guid')],
          Name: [this.getTextContent(extEl, 'Name')],
          ObjectId: [this.getTextContent(extEl, 'ObjectId')],
          ExcavationType: [this.getTextContent(extEl, 'ExcavationType')],
          Sections: [this.getTextContent(extEl, 'Sections')]
        };
        result.Excavations.Excavation.push(excavation);
      });
    }
    
    // Парсим Horizons
    const horizonsElement = xmlDoc.querySelector('Horizons');
    if (horizonsElement) {
      result.Horizons = { Horizon: [] };
      const horizonElements = horizonsElement.querySelectorAll('Horizon');
      horizonElements.forEach(horEl => {
        const horizon = {
          Id: [this.getTextContent(horEl, 'Id')],
          Guid: [this.getTextContent(horEl, 'Guid')],
          Name: [this.getTextContent(horEl, 'Name')],
          Altitude: [this.getTextContent(horEl, 'Altitude')],
          IsMine: [this.getTextContent(horEl, 'IsMine')],
          ObjectId: [this.getTextContent(horEl, 'ObjectId')],
          Sections: [this.getTextContent(horEl, 'Sections')]
        };
        result.Horizons.Horizon.push(horizon);
      });
    }
    
    return result;
  }

  private getTextContent(parent: Element, tagName: string): string {
    const element = parent.querySelector(tagName);
    return element ? element.textContent || '' : '';
  }

  async buildMineGraph(xmlData: any): Promise<MineGraph> {
    console.log('Building mine graph...');
    
    const nodesMap = new Map<number, Node>();
    if (xmlData.Nodes?.Node) {
      const nodesArray = Array.isArray(xmlData.Nodes.Node) 
        ? xmlData.Nodes.Node 
        : [xmlData.Nodes.Node];
      
      nodesArray.forEach((nodeData: any) => {
        const node = new Node(
          parseInt(nodeData.Id[0]),
          nodeData.Guid[0],
          parseFloat(nodeData.X[0]),
          parseFloat(nodeData.Y[0]),
          parseFloat(nodeData.Z[0])
        );
        nodesMap.set(node.id, node);
      });
    }

    const sectionsMap = new Map<number, Section>();
    if (xmlData.Sections?.Section) {
      const sectionsArray = Array.isArray(xmlData.Sections.Section) 
        ? xmlData.Sections.Section 
        : [xmlData.Sections.Section];
      
      sectionsArray.forEach((sectionData: any) => {
        const startNodeId = parseInt(sectionData.StartNodeId[0]);
        const endNodeId = parseInt(sectionData.EndNodeId[0]);
        const startNode = nodesMap.get(startNodeId);
        const endNode = nodesMap.get(endNodeId);
        
        if (startNode && endNode) {
          const section = new Section(
            parseInt(sectionData.Id[0]),
            sectionData.Guid[0],
            startNode,
            endNode,
            parseFloat(sectionData.Thickness[0])
          );
          sectionsMap.set(section.id, section);
        } else {
          console.warn(`Section ${sectionData.Id[0]}: nodes not found (start: ${startNodeId}, end: ${endNodeId})`);
        }
      });
    }

    const excavationsMap = new Map<number, Excavation>();
    if (xmlData.Excavations?.Excavation) {
      const excavationsArray = Array.isArray(xmlData.Excavations.Excavation)
        ? xmlData.Excavations.Excavation
        : [xmlData.Excavations.Excavation];
      
      excavationsArray.forEach((excData: any) => {
        const sectionIdsStr = excData.Sections[0];
        if (sectionIdsStr && sectionIdsStr.trim()) {
          const sectionIds = sectionIdsStr.split(',').map(Number);
          const sections = sectionIds
            .map((id: number) => sectionsMap.get(id))
            .filter((s: Section | undefined): s is Section => s !== undefined);
          
          const excavation = new Excavation(
            parseInt(excData.Id[0]),
            excData.Guid[0],
            excData.Name[0],
            excData.ObjectId[0],
            excData.ExcavationType[0],
            sections
          );
          excavationsMap.set(excavation.id, excavation);
        }
      });
    }

    const horizons: Horizon[] = [];
    if (xmlData.Horizons?.Horizon) {
      const horizonsArray = Array.isArray(xmlData.Horizons.Horizon)
        ? xmlData.Horizons.Horizon
        : [xmlData.Horizons.Horizon];
      
      horizonsArray.forEach((horData: any) => {
        const sectionIdsStr = horData.Sections[0];
        if (sectionIdsStr && sectionIdsStr.trim()) {
          const sectionIds = sectionIdsStr.split(',').map(Number);
          const sections = sectionIds
            .map((id: number) => sectionsMap.get(id))
            .filter((s: Section | undefined): s is Section => s !== undefined);
          
          const horizon = new Horizon(
            parseInt(horData.Id[0]),
            horData.Guid[0],
            horData.Name[0],
            parseFloat(horData.Altitude[0]),
            horData.IsMine[0] === 'true',
            horData.ObjectId[0],
            sections
          );
          horizons.push(horizon);
        }
      });
    }

    const mineGraph = new MineGraph(
      nodesMap,
      sectionsMap,
      excavationsMap,
      horizons
    );

    const validation = mineGraph.validate();
    if (!validation.isValid) {
      console.warn('Graph validation errors:', validation.errors.slice(0, 10));
    } else {
      console.log('Graph validation passed');
    }

    return mineGraph;
  }
}