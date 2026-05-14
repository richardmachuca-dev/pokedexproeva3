import React, { useState, useEffect } from 'react';

const TYPE_DATA = {
  normal: { strongAgainst: [], weakAgainst: ['fighting'] },
  fire: { strongAgainst: ['grass', 'ice', 'bug', 'steel'], weakAgainst: ['water', 'ground', 'rock'] },
  water: { strongAgainst: ['fire', 'ground', 'rock'], weakAgainst: ['grass', 'electric'] },
  grass: { strongAgainst: ['water', 'ground', 'rock'], weakAgainst: ['fire', 'ice', 'poison', 'flying', 'bug'] },
  electric: { strongAgainst: ['water', 'flying'], weakAgainst: ['ground'] },
  ice: { strongAgainst: ['grass', 'ground', 'flying', 'dragon'], weakAgainst: ['fire', 'fighting', 'rock', 'steel'] },
  fighting: { strongAgainst: ['normal', 'ice', 'rock', 'dark', 'steel'], weakAgainst: ['flying', 'psychic', 'fairy'] },
  poison: { strongAgainst: ['grass', 'fairy'], weakAgainst: ['ground', 'psychic'] },
  ground: { strongAgainst: ['fire', 'electric', 'poison', 'rock', 'steel'], weakAgainst: ['water', 'grass', 'ice'] },
  flying: { strongAgainst: ['grass', 'fighting', 'bug'], weakAgainst: ['electric', 'ice', 'rock'] },
  psychic: { strongAgainst: ['fighting', 'poison'], weakAgainst: ['bug', 'ghost', 'dark'] },
  bug: { strongAgainst: ['grass', 'psychic', 'dark'], weakAgainst: ['fire', 'flying', 'rock'] },
  rock: { strongAgainst: ['fire', 'ice', 'flying', 'bug'], weakAgainst: ['water', 'grass', 'fighting', 'ground', 'steel'] },
  ghost: { strongAgainst: ['psychic', 'ghost'], weakAgainst: ['ghost', 'dark'] },
  dragon: { strongAgainst: ['dragon'], weakAgainst: ['ice', 'dragon', 'fairy'] },
  dark: { strongAgainst: ['psychic', 'ghost'], weakAgainst: ['fighting', 'bug', 'fairy'] },
  steel: { strongAgainst: ['ice', 'rock', 'fairy'], weakAgainst: ['fire', 'fighting', 'ground'] },
  fairy: { strongAgainst: ['fighting', 'dragon', 'dark'], weakAgainst: ['poison', 'steel'] }
};

export default function TarjetaPokemon({ pokemonNameOrId, onCapture, onToggleParty, isCaptured, inParty, partyFull }) {
  const [pokemon, setPokemon] = useState(null);
  const [movesDetails, setMovesDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animatingCatch, setAnimatingCatch] = useState(false);

  useEffect(() => {
    if (!pokemonNameOrId) return;
    
    setLoading(true);
    setError(null);
    setMovesDetails([]);
    
    fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonNameOrId}`)
      .then(res => {
        if (!res.ok) throw new Error('Pokémon no encontrado');
        return res.json();
      })
      .then(async data => {
        setPokemon(data);
        
        // Cargar los detalles de los primeros 6 movimientos para obtener sus tipos
        const movesToFetch = data.moves.slice(0, 6);
        const movesData = await Promise.all(
          movesToFetch.map(async m => {
            try {
              const r = await fetch(m.move.url);
              const d = await r.json();
              return { name: m.move.name.replace('-', ' '), type: d.type.name };
            } catch(e) {
              return { name: m.move.name.replace('-', ' '), type: 'normal' };
            }
          })
        );
        setMovesDetails(movesData);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [pokemonNameOrId]);

  if (!pokemonNameOrId) return null;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <div className="pokeball-loader"></div>
      </div>
    );
  }

  if (error) {
    return <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: '#ff6b6b' }}>{error}</div>;
  }

  if (!pokemon) return null;

  const mainType = pokemon.types[0].type.name;
  const cardColorVar = `var(--type-${mainType})`;
  
  // Calcular debilidades individuales (union basica)
  const weaknessesSet = new Set();
  pokemon.types.forEach(t => {
    const tData = TYPE_DATA[t.type.name];
    if (tData) {
      tData.weakAgainst.forEach(w => weaknessesSet.add(w));
    }
  });
  // Opcional: remover resistencias (si somos fuego/volador, bicho nos hace normal, pero fuego resiste bicho y volador también. Para ser simple, mostraremos debilidades puras agregadas)
  const weaknesses = Array.from(weaknessesSet);

  const handleCapture = () => {
    if (!isCaptured) {
      setAnimatingCatch(true);
      setTimeout(() => {
        onCapture(pokemon);
        setAnimatingCatch(false);
      }, 600); // Duración de la animación
    }
  };

  return (
    <div 
      className={`glass-card animate-fade ${animatingCatch ? 'catch-animation' : ''}`}
      style={{
        maxWidth: '500px',
        margin: '2rem auto',
        boxShadow: `0 10px 30px -10px ${cardColorVar}`,
        borderTop: `4px solid ${cardColorVar}`
      }}
    >
      <div style={{ padding: '2rem', textAlign: 'center', background: `linear-gradient(180deg, ${cardColorVar}22 0%, transparent 100%)` }}>
        <h2 style={{ textTransform: 'capitalize', fontSize: '2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          {pokemon.name}
          <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>#{pokemon.id.toString().padStart(3, '0')}</span>
        </h2>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '1.5rem' }}>
          {pokemon.types.map(t => (
            <span 
              key={t.type.name} 
              style={{
                background: `var(--type-${t.type.name})`,
                color: '#fff',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}
            >
              {t.type.name}
            </span>
          ))}
        </div>

        <div style={{
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '50%',
          width: '200px',
          height: '200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          {isCaptured && (
            <svg style={{ position: 'absolute', top: '10px', right: '10px', width: '24px', height: '24px', fill: 'var(--type-fire)' }} viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6h12c0-3.31-2.69-6-6-6z"/>
            </svg>
          )}
          <img 
            src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default} 
            alt={pokemon.name}
            style={{ width: '90%', height: '90%', objectFit: 'contain', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.5))' }}
          />
        </div>
      </div>

      <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        
        {/* Debilidades */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Débil contra</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {weaknesses.map(w => (
              <span key={w} style={{ 
                background: `var(--type-${w})`, 
                padding: '2px 8px', 
                borderRadius: '12px', 
                fontSize: '0.7rem', 
                fontWeight: '600', 
                textTransform: 'uppercase', 
                textShadow: '0 1px 2px rgba(0,0,0,0.5)' 
              }}>
                {w}
              </span>
            ))}
          </div>
        </div>

        {/* Ataques Principales */}
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Ataques Principales</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {movesDetails.map(m => (
              <div key={m.name} style={{ 
                background: 'rgba(255,255,255,0.05)', 
                padding: '6px 10px', 
                borderRadius: '8px', 
                fontSize: '0.8rem', 
                textTransform: 'capitalize',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '65%' }}>{m.name}</span>
                <span style={{ 
                  background: `var(--type-${m.type})`, 
                  padding: '2px 6px', 
                  borderRadius: '10px', 
                  fontSize: '0.65rem', 
                  fontWeight: '600', 
                  textTransform: 'uppercase',
                  textShadow: '0 1px 1px rgba(0,0,0,0.5)'
                }}>
                  {m.type}
                </span>
              </div>
            ))}
            {movesDetails.length === 0 && <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Cargando ataques...</span>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          {!isCaptured ? (
            <button className="btn-poke" style={{ flex: 1, justifyContent: 'center', borderColor: cardColorVar, color: cardColorVar }} onClick={handleCapture}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle><line x1="12" y1="2" x2="12" y2="9"></line><line x1="12" y1="15" x2="12" y2="22"></line></svg>
              Capturar
            </button>
          ) : (
            <button className="btn-poke" style={{ flex: 1, justifyContent: 'center', background: 'rgba(255,255,255,0.1)', borderColor: 'transparent' }} disabled>
              Capturado ✓
            </button>
          )}

          {isCaptured && (
            <button 
              className="btn-poke" 
              style={{ 
                flex: 1, 
                justifyContent: 'center', 
                borderColor: inParty ? 'var(--type-grass)' : (partyFull ? 'var(--text-muted)' : 'var(--text-main)'),
                color: inParty ? 'var(--type-grass)' : (partyFull ? 'var(--text-muted)' : 'var(--text-main)')
              }} 
              onClick={() => onToggleParty(pokemon)}
              disabled={!inParty && partyFull}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              {inParty ? 'En Equipo' : 'Añadir al Equipo'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
