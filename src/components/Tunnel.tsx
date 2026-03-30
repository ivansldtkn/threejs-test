import { useMemo } from 'react';
import { TubeGeometry, CatmullRomCurve3, Color } from 'three';
import { Section } from '../models/Section';

interface TunnelProps {
  section: Section;
  radius?: number;
  color?: string;
}

export const Tunnel = ({ section, radius = 2, color = '#ff8844' }: TunnelProps) => {
  const geometry = useMemo(() => {
    try {
      const start = section.getStartPoint();
      const end = section.getEndPoint();
      
      if (!start || !end) {
        return null;
      }
      
      const distance = start.distanceTo(end);
      if (distance < 0.1) {
        return null;
      }
      
      // Для очень длинных секций увеличиваем количество сегментов
      const tubularSegments = Math.max(20, Math.floor(distance / 5));
      const radialSegments = 8;
      
      // Создаем кривую
      const points = [start, end];
      const curve = new CatmullRomCurve3(points);
      
      const tubeGeometry = new TubeGeometry(
        curve, 
        tubularSegments, 
        radius, 
        radialSegments, 
        false
      );
      
      return tubeGeometry;
    } catch (error) {
      console.error(`Error creating geometry for section ${section.id}:`, error);
      return null;
    }
  }, [section, radius]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial 
        color={color} 
        roughness={0.3} 
        metalness={0.7}
        emissive={new Color(color)}
        emissiveIntensity={0.1}
      />
    </mesh>
  );
};