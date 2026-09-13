import { useState } from 'react'

import type { Design, Grid, Photo, Cell } from './types.ts';

import Header from './components/Header';
import Canvas from './components/Canvas';
import Sidebar from './components/Sidebar';
import DesignModal from './components/DesignModal';

function App() {
  const [x, setX] = useState(1);
  const [y, setY] = useState(1);
  const [opacity, setOpacity] = useState(100);
  const [action, setAction] = useState<'existing' | 'new' | 'save' | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [design, setDesign] = useState<Design | null>(null);

  /**
   * TODO
   *  - Make sidebar refresh with update
   *  - Finish project :)
   */

  const handleSetDesign = (newDesign: Design | null) => {
    setDesign(newDesign);
    if (newDesign) {
      setX(newDesign.grid.columns);
      setY(newDesign.grid.rows);
      setIsModalOpen(false);
    }
  }

  const handleOpenDesign = () => {
    setIsModalOpen(true);
    setAction('existing');
  };

  const handleNewDesign = () => {
    setIsModalOpen(true);
    setAction('new');
  }

  const handleSaveDesign = () => {
    setIsModalOpen(true);
    setAction('save');
  }

  return (
    <div className="flex flex-col h-screen">

      {/* TEST DESIGN {design?.name || 'No Design Loaded'}<br />
      TEST GRID {design?.grid.rows} x {design?.grid.columns}<br />
      TEST PHOTO {design?.photo ? 'Yes' : 'No'}<br />
      TEST CELLS {design?.grid.cells.length || 0}<br /> */}

      <Header 
        onOpenDesign={handleOpenDesign} 
        onNewDesign={handleNewDesign}
        onSaveDesign={handleSaveDesign}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          x={x}
          y={y}
          opacity={opacity}
          onXChange={setX}
          onYChange={setY}
          onOpacityChange={setOpacity}
        />
        {/* TODO: MAKE CANVAS TAKE IN DESIGN */}
        <Canvas rows={y} columns={x} /> 
        {
          isModalOpen && 
          <DesignModal 
            action={action}
            setDesign={handleSetDesign}
            onClose={() => setIsModalOpen(false)} />
        }
      </div>
    </div>
  )
}

export default App
