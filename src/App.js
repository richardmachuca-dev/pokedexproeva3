import React, { useState, useEffect } from 'react';
import './index.css';
import BuscadorPokemon from './components/BuscadorPokemon';
import TarjetaPokemon from './components/TarjetaPokemon';
import EquipoBatalla from './components/EquipoBatalla';
import ResumenCapturas from './components/ResumenCapturas';
import ResultadosTipo from './components/ResultadosTipo';

function App() {
  const [currentSearch, setCurrentSearch] = useState(null);
  const [currentTypes, setCurrentTypes] = useState([]);
  const [capturedPokemons, setCapturedPokemons] = useState([]);
  const [party, setParty] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar de localStorage
  useEffect(() => {
    const savedCaptured = localStorage.getItem('pokedex_captured');
    const savedParty = localStorage.getItem('pokedex_party');
    
    if (savedCaptured) {
      try { setCapturedPokemons(JSON.parse(savedCaptured)); } catch(e) {}
    }
    if (savedParty) {
      try { setParty(JSON.parse(savedParty)); } catch(e) {}
    }
    setIsLoaded(true);
  }, []);

  // Guardar en localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('pokedex_captured', JSON.stringify(capturedPokemons));
      localStorage.setItem('pokedex_party', JSON.stringify(party));
    }
  }, [capturedPokemons, party, isLoaded]);

  const handleCapture = (pokemon) => {
    if (!capturedPokemons.find(p => p.id === pokemon.id)) {
      setCapturedPokemons([...capturedPokemons, { id: pokemon.id, name: pokemon.name }]);
    }
  };

  const handleToggleParty = (pokemon) => {
    const inParty = party.find(p => p.id === pokemon.id);
    if (inParty) {
      setParty(party.filter(p => p.id !== pokemon.id));
    } else {
      if (party.length < 6) {
        setParty([...party, pokemon]);
      }
    }
  };

  const handleRemoveFromParty = (pokemon) => {
    setParty(party.filter(p => p.id !== pokemon.id));
  };

  const handleSelectPokemon = (nameOrId) => {
    setCurrentSearch(nameOrId);
    setCurrentTypes([]);
  };

  const handleToggleType = (type) => {
    setCurrentTypes(prev => {
      let newTypes;
      if (prev.includes(type)) {
        newTypes = prev.filter(t => t !== type);
      } else {
        // Limitar a máximo 2 tipos para buscar combinaciones (dual types)
        newTypes = prev.length >= 2 ? [prev[1], type] : [...prev, type];
      }
      return newTypes;
    });
    setCurrentSearch(null);
  };

  if (!isLoaded) return null;

  return (
    <div className="app-container">
      <ResumenCapturas 
        capturedPokemons={capturedPokemons} 
        party={party}
        onToggleParty={handleToggleParty}
        onSelectPokemon={handleSelectPokemon} 
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ textAlign: 'center', marginBottom: '1rem', position: 'relative' }}>
          <h1 className="font-pixel" style={{ fontSize: '3.5rem', letterSpacing: '2px', color: '#ffcb05', textShadow: '4px 4px 0 #2a75bb, -1px -1px 0 #2a75bb, 1px -1px 0 #2a75bb, -1px 1px 0 #2a75bb, 1px 1px 0 #2a75bb' }}>
            POKÉDEX PRO
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Busca, Captura y Forma tu Equipo</p>
        </header>

      <main>
        <EquipoBatalla 
          party={party} 
          onRemoveFromParty={handleRemoveFromParty} 
          onSelectPokemon={handleSelectPokemon}
        />

        <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', overflow: 'visible', position: 'relative', zIndex: 50 }}>
          <h3 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Buscador de Datos</h3>
          <BuscadorPokemon 
            onSelectPokemon={handleSelectPokemon} 
            onToggleType={handleToggleType}
            selectedTypes={currentTypes}
          />
        </div>

        {currentSearch ? (
          <TarjetaPokemon 
            pokemonNameOrId={currentSearch} 
            onCapture={handleCapture}
            onToggleParty={handleToggleParty}
            isCaptured={!!capturedPokemons.find(p => p.name === currentSearch || p.id.toString() === currentSearch)}
            inParty={!!party.find(p => p.name === currentSearch || p.id.toString() === currentSearch)}
            partyFull={party.length >= 6}
          />
        ) : currentTypes.length > 0 ? (
          <ResultadosTipo 
            types={currentTypes} 
            onSelectPokemon={handleSelectPokemon} 
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 0', opacity: 0.5 }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ marginBottom: '1rem' }}>
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <p>Utiliza el buscador de arriba para analizar un Pokémon o explorar por tipo.</p>
          </div>
        )}
        </main>
      </div>
    </div>
  );
}

export default App;
