import React, { useState, useEffect } from 'react';

const TYPES = ['normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];

export default function BuscadorPokemon({ onSelectPokemon, onToggleType, selectedTypes = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [allPokemons, setAllPokemons] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  // Fetch all pokemon names for autocompletion
  useEffect(() => {
    fetch('https://pokeapi.co/api/v2/pokemon?limit=1000')
      .then(res => res.json())
      .then(data => {
        setAllPokemons(data.results);
      })
      .catch(err => console.error("Error fetching pokemon list:", err));
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value.toLowerCase();
    setSearchTerm(val);
    
    if (val.length > 1) {
      const filtered = allPokemons
        .filter(p => p.name.includes(val))
        .sort((a, b) => {
          const idA = parseInt(a.url.split('/').slice(-2, -1)[0]);
          const idB = parseInt(b.url.split('/').slice(-2, -1)[0]);
          return idA - idB;
        });
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = (name) => {
    setSearchTerm('');
    setSuggestions([]);
    onSelectPokemon(name);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchTerm.trim() !== '') {
      onSelectPokemon(searchTerm.toLowerCase());
      setSearchTerm('');
      setSuggestions([]);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
      <input
        type="text"
        className="search-input"
        placeholder="Busca un Pokémon por nombre o ID..."
        value={searchTerm}
        onChange={handleSearchChange}
        onKeyDown={handleKeyDown}
      />
      {suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'rgba(30, 30, 30, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '0 0 16px 16px',
          overflowY: 'auto',
          maxHeight: '400px',
          zIndex: 10,
          border: '1px solid rgba(255,255,255,0.1)',
          borderTop: 'none',
          boxShadow: '0 10px 20px rgba(0,0,0,0.5)'
        }}>
          {suggestions.map((p, i) => (
            <div 
              key={i}
              style={{
                padding: '12px 20px',
                cursor: 'pointer',
                borderBottom: i === suggestions.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)',
                textTransform: 'capitalize',
                transition: 'background 0.2s'
              }}
              onClick={() => handleSelect(p.name)}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              <svg style={{width: '16px', height: '16px', marginRight: '10px', opacity: 0.5}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <span style={{color: 'var(--text-muted)', marginRight: '10px', fontSize: '0.8rem'}}>#{p.url.split('/').slice(-2, -1)[0].padStart(3, '0')}</span>
              {p.name}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
        {TYPES.map(type => {
          const isSelected = selectedTypes.includes(type);
          return (
            <button
              key={type}
              onClick={() => {
                setSearchTerm('');
                setSuggestions([]);
                onToggleType(type);
              }}
              style={{
                background: `var(--type-${type})`,
                border: isSelected ? '2px solid #fff' : '2px solid transparent',
                padding: '4px 12px',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s, border 0.2s',
                boxShadow: isSelected ? `0 0 10px var(--type-${type})` : '0 2px 4px rgba(0,0,0,0.3)',
                transform: isSelected ? 'scale(1.05)' : 'scale(1)'
              }}
              onMouseEnter={e => { if(!isSelected) e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)' }}
              onMouseLeave={e => { if(!isSelected) e.currentTarget.style.transform = 'translateY(0) scale(1)' }}
              title={`Ver Pokémon de tipo ${type}`}
            >
              {type}
            </button>
          );
        })}
      </div>
    </div>
  );
}
