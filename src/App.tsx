import { useState, useEffect, Suspense } from 'react';
import { MineStore } from './store/MineStore';
import { XmlParserService } from './services/XmlParserService';
import { Menu } from './components/Menu';
import { Canvas3D } from './components/Canvas3D';
import './App.css';

function App() {
  const [store] = useState(() => new MineStore());

  useEffect(() => {
    const loadData = async () => {
      try {
        store.setLoading(true);
        store.setError(null);
        
        const parser = new XmlParserService();
        
        const response = await fetch('/MIM_Scheme.xml');
        if (!response.ok) {
          throw new Error(`failed fecth scheme! status: ${response.status}.`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const file = new File([arrayBuffer], 'MIM_Scheme.xml', { type: 'text/xml' });
        
        const xmlData = await parser.parseXmlFile(file);
        const graph = await parser.buildMineGraph(xmlData);
        
        store.setMineGraph(graph);
        
        console.log('Data loaded successfully');
      } catch (err) {
        console.error('Error loading data:', err);
        store.setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
      } finally {
        store.setLoading(false);
      }
    };

    loadData();
  }, [store]);

  if (store.error) {
    return (
      <div className="error" >
        <div>
          <h2>Ошибка загрузки</h2>
          <p>{store.error}</p>
          <button 
            className="reload-button"
            onClick={() => window.location.reload()}
          >
            Повторить
          </button>
        </div>
      </div>
    );
  }

  if (store.loading) {
    return (
      <div className="loading">
        <h2>Загрузка данных шахты...</h2>
        <p>Парсинг XML файла</p>
      </div>
    );
  }

  return (
    <>
      <div className="app">
        <Menu store={store} />
        <Suspense fallback={<div className="loading-spinner">Загрузка 3D сцены...</div>}>
          <Canvas3D store={store} />
        </Suspense>
      </div>
    </>
  );
}

export default App;