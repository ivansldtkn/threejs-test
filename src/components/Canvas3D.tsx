import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';
import { MineStore } from '../store/MineStore';
import { Tunnel } from './Tunnel';

interface Canvas3DProps {
  store: MineStore;
}

export const Canvas3D = observer(({ store }: Canvas3DProps) => {
  const visibleSections = store.visibleSectionsBySelectedHorizon;
  const excavations = store.allExcavations;

  const excavationColorMap = useMemo(() => {
    const colorMap = new Map<number, string>();

    excavations.forEach(ext => {
      ext.sections.forEach(section => {
        colorMap.set(section.id, ext.color);
      });
    });

    return colorMap;
  }, [excavations])

  if (!store.center || !store.optimalCameraDistance) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#1a1a2e',
        color: '#fff'
      }}>
        <div>
          <h3>Расчет геометрии...</h3>
        </div>
      </div>
    );
  }

  const center = store.center;
  const distance = store.optimalCameraDistance;
  const gridSize = Math.max(500, distance * 2);

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      position: 'relative',
      background: '#0a0a1a'
    }}>
        <Canvas
          camera={{
            position: [center.x, center.y + distance * 0.3, center.z + distance],
            fov: 60,
            near: 0.1,
            far: 10000
          }}
        >
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            zoomSpeed={1.2}
            panSpeed={0.8}
            rotateSpeed={1.0}
            target={[center.x, center.y, center.z]}
            makeDefault
          />
          
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 20, 5]} intensity={1.5} />
          <directionalLight position={[-10, 20, -5]} intensity={0.8} />
          <pointLight position={[center.x, center.y + 50, center.z]} intensity={0.5} />
          
          <Grid
            args={[gridSize, gridSize]}
            cellColor="#888888"
            sectionColor="#444444"
            cellSize={gridSize / 20}
            sectionSize={gridSize / 4}
            fadeDistance={gridSize}
            position={[center.x, center.y, center.z]}
          />

          {visibleSections.map(section => (
            <Tunnel 
              key={`section-${section.id}`} 
              section={section}
              radius={Math.max(1, section.thickness / 2)}
              color={excavationColorMap.get(section.id) || '#ff6600'}
            />
          ))}
        </Canvas>
    </div>
  );
});
