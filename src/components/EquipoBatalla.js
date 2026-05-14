import React, { useState, useRef, useEffect } from 'react';

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

const PokemonTooltip = ({ pokemon, mainType }) => {
  const [movesWithTypes, setMovesWithTypes] = useState([]);
  const [loadingMoves, setLoadingMoves] = useState(true);

  const strengths = new Set();
  const weaknesses = new Set();
  
  pokemon.types.forEach(t => {
    const tName = t.type.name;
    if (TYPE_DATA[tName]) {
      TYPE_DATA[tName].strongAgainst.forEach(s => strengths.add(s));
      TYPE_DATA[tName].weakAgainst.forEach(w => weaknesses.add(w));
    }
  });
  
  // Cancelar debilidades si otro tipo propio es resistente (aproximación simplificada)
  strengths.forEach(s => weaknesses.delete(s));

  useEffect(() => {
    let mounted = true;
    const fetchMoves = async () => {
      try {
        const movesToFetch = pokemon.moves.slice(0, 40); // Limitar a 40 para evitar colapsar la API, cubre la mayoría del moveset inicial
        const results = await Promise.all(
          movesToFetch.map(m => fetch(m.move.url).then(r => r.json()))
        );
        if (mounted) {
          setMovesWithTypes(results.map(r => ({
            name: r.name,
            type: r.type.name
          })));
          setLoadingMoves(false);
        }
      } catch (e) {
        if (mounted) setLoadingMoves(false);
      }
    };
    fetchMoves();
    return () => { mounted = false; };
  }, [pokemon]);

  return (
    <div style={{
      position: 'absolute',
      top: '100%',
      marginTop: '10px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '320px',
      background: 'rgba(20,20,20,0.98)',
      backdropFilter: 'blur(15px)',
      border: `1px solid var(--type-${mainType})`,
      borderRadius: '12px',
      padding: '1rem',
      zIndex: 1000,
      boxShadow: '0 10px 30px rgba(0,0,0,0.9)',
      animation: 'fadeIn 0.2s ease forwards',
      pointerEvents: 'none',
      textAlign: 'left'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '1rem', fontWeight: 'bold', textTransform: 'capitalize' }}>{pokemon.name}</span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>#{pokemon.id}</span>
      </div>

      <div style={{ display: 'flex', gap: '4px', marginBottom: '0.8rem' }}>
        {pokemon.types.map(t => (
          <span key={t.type.name} style={{ background: `var(--type-${t.type.name})`, padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 'bold' }}>
            {t.type.name}
          </span>
        ))}
      </div>

      <div style={{ marginBottom: '0.8rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ventaja contra:</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
          {Array.from(strengths).map(t => (
            <span key={t} style={{ background: `var(--type-${t})`, padding: '2px 4px', borderRadius: '4px', fontSize: '0.6rem', textTransform: 'uppercase' }}>{t}</span>
          ))}
          {strengths.size === 0 && <span style={{fontSize: '0.65rem', color:'var(--text-muted)'}}>- Ninguna -</span>}
        </div>
      </div>

      <div style={{ marginBottom: '0.8rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Débil ante:</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
          {Array.from(weaknesses).map(t => (
            <span key={t} style={{ background: `var(--type-${t})`, padding: '2px 4px', borderRadius: '4px', fontSize: '0.6rem', textTransform: 'uppercase' }}>{t}</span>
          ))}
          {weaknesses.size === 0 && <span style={{fontSize: '0.65rem', color:'var(--text-muted)'}}>- Ninguna -</span>}
        </div>
      </div>

      <div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ataques Disponibles {pokemon.moves.length > 40 ? '(Primeros 40)' : ''}:</span>
        {loadingMoves ? (
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Cargando ataques...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: '4px', maxHeight: '150px', overflowY: 'auto' }}>
            {movesWithTypes.map(m => (
              <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '2px 4px', borderRadius: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: `var(--type-${m.type})` }}></span>
                <span style={{ fontSize: '0.65rem', textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {m.name.replace('-', ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function EquipoBatalla({ party, onRemoveFromParty, onSelectPokemon }) {
  const [hoveredPokemonId, setHoveredPokemonId] = useState(null);
  const hoverTimeoutRef = useRef(null);
  const slots = Array(6).fill(null);
  
  // Calculate summary
  const typeCounts = {};
  const abilityNames = new Set();
  
  const teamStrengths = new Set();
  const teamWeaknesses = new Set();

  party.forEach(p => {
    p.types.forEach(t => {
      const typeName = t.type.name;
      typeCounts[typeName] = (typeCounts[typeName] || 0) + 1;
      
      if (TYPE_DATA[typeName]) {
        TYPE_DATA[typeName].strongAgainst.forEach(s => teamStrengths.add(s));
        TYPE_DATA[typeName].weakAgainst.forEach(w => teamWeaknesses.add(w));
      }
    });
    p.abilities.forEach(a => abilityNames.add(a.ability.name.replace('-', ' ')));
  });

  const strengthsArray = Array.from(teamStrengths).slice(0, 10);
  const weaknessesArray = Array.from(teamWeaknesses).filter(w => !teamStrengths.has(w)).slice(0, 10);

  const handleMouseEnter = (pokemonId) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredPokemonId(pokemonId);
    }, 1000);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoveredPokemonId(null);
  };

  return (
    <div style={{ marginBottom: '2rem', position: 'relative', zIndex: 100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
          Equipo de Batalla ({party.length}/6)
        </h3>
      </div>
      
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        background: 'rgba(0,0,0,0.2)',
        padding: '1.5rem',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', 
          gap: '1rem'
        }}>
          {slots.map((_, index) => {
            const pokemon = party[index];
            
            if (!pokemon) {
              return (
                <div key={`empty-${index}`} style={{ 
                  aspectRatio: '1', 
                  borderRadius: '50%', 
                  border: '2px dashed rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255,255,255,0.02)'
                }}>
                  <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: '1.5rem', fontWeight: 'bold' }}>{index + 1}</span>
                </div>
              );
            }

            const mainType = pokemon.types[0].type.name;

            return (
              <div 
                key={pokemon.id} 
                className="animate-fade" 
                style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
                onClick={() => onSelectPokemon(pokemon.name)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  handleMouseEnter(pokemon.id);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  handleMouseLeave();
                }}
              >
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: `var(--type-${mainType})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 0 15px rgba(0,0,0,0.5)`,
                  border: '2px solid rgba(255,255,255,0.3)',
                  position: 'relative',
                  transform: hoveredPokemonId === pokemon.id ? 'scale(1.75)' : 'scale(1)',
                  transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}>
                  <img 
                    src={pokemon.sprites.front_default || pokemon.sprites.other['official-artwork'].front_default} 
                    alt={pokemon.name} 
                    style={{ width: '80%', height: '80%', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                  />
                </div>
                <span style={{ marginTop: '0.5rem', fontSize: '0.8rem', textTransform: 'capitalize', fontWeight: '600' }}>{pokemon.name}</span>
                
                {hoveredPokemonId === pokemon.id && (
                  <PokemonTooltip pokemon={pokemon} mainType={mainType} />
                )}

                <button 
                  onClick={(e) => {
                    e.stopPropagation(); // Avoid selecting pokemon
                    onRemoveFromParty(pokemon);
                    handleMouseLeave(); // Clear tooltip state on remove
                  }}
                  style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '0',
                    background: 'var(--type-fire)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
                  }}
                  title="Quitar del equipo"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            );
          })}
        </div>

        {party.length > 0 && (
          <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h4 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '0.95rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Análisis Táctico del Equipo</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              
              <div>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--type-grass)', marginBottom: '0.5rem', fontWeight: '600' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Fuertes contra:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {strengthsArray.map(type => (
                    <span key={type} style={{
                      background: `var(--type-${type})`, padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase', textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                    }}>
                      {type}
                    </span>
                  ))}
                  {strengthsArray.length === 0 && <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Ninguna ventaja clara.</span>}
                </div>
              </div>

              <div>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--type-fire)', marginBottom: '0.5rem', fontWeight: '600' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                  Débiles ante (sin cobertura):
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {weaknessesArray.map(type => (
                    <span key={type} style={{
                      background: `var(--type-${type})`, padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase', textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                    }}>
                      {type}
                    </span>
                  ))}
                  {weaknessesArray.length === 0 && <span style={{fontSize: '0.75rem', color: 'var(--type-grass)'}}>Tu equipo cubre bien las debilidades.</span>}
                </div>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Cobertura de Tipos:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {Object.entries(typeCounts).map(([type, count]) => (
                    <span key={type} style={{
                      background: `var(--type-${type})`, padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase', textShadow: '0 1px 2px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                      {type} <span style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{count}</span>
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
