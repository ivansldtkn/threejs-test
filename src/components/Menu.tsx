import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { MineStore } from '../store/MineStore';

interface MenuProps {
  store: MineStore;
}

export const Menu = observer(({ store }: MenuProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const horizons = store.allHorizons;
  const selectedHorizon = store.selectedHorizon;
  const excavations = store.excavationsBySelectedHorizon;

  return (
    <div className={`menu ${collapsed ? 'menu--collapsed' : ''}`}>
      <div className="menu-header">
        <div className="menu-header-row">
          <h2>Шахта</h2>
          <button
            type="button"
            className="menu-toggle"
            onClick={() => setCollapsed((c) => !c)}
            aria-expanded={!collapsed}
            title={collapsed ? 'Развернуть' : 'Свернуть'}
            aria-label={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
          >
            {collapsed ? '▲' : '▼'}
          </button>
        </div>
        <div className="stats">
          <span>Горизонтов: {horizons?.length ?? 0}</span>
        </div>
      </div>

      {!collapsed && (
        <>
          <div className="horizon-selector">
            <label>Горизонт:</label>
            <select
              value={selectedHorizon?.id || ''}
              onChange={(e) => {
                const horizon = horizons.find((h) => h.id === Number(e.target.value));
                if (horizon) store.setSelectedHorizon(horizon);
              }}
            >
              {horizons.map((horizon) => (
                <option key={horizon.id} value={horizon.id}>
                  {horizon.name} (отм. {horizon.altitude}м)
                </option>
              ))}
            </select>
          </div>

          <div className="excavations-list">
            <h3>Выработки горизонта</h3>
            {excavations.length === 0 ? (
              <div className="empty-state">Нет выработок</div>
            ) : (
              excavations.map((ext) => (
                <div key={ext.id} className="excavation-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={ext.visible}
                      onChange={() => store.toggleExcavation(ext)}
                    />
                    <span>{ext.name}</span>
                    <span className="section-count">({ext.sections.length} секций)</span>
                  </label>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
});