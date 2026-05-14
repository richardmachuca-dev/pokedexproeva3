import React, { useState } from 'react';

export default function ResumenCapturas({ capturedPokemons, party, onSelectPokemon, onToggleParty }) {
  const [loadingId, setLoadingId] = useState(null);

  const handleToggle = async (e, p) => {
    e.stopPropagation();
    
    // Si ya está en el equipo, lo removemos (solo necesitamos pasar un objeto con el id)
    if (party.find(member => member.id === p.id)) {
      onToggleParty({ id: p.id });
      return;
    }

    if (party.length >= 6) {
      alert('Tu equipo ya tiene 6 Pokémon.');
      return;
    }

    setLoadingId(p.id);
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${p.id}`);
      const fullPokemon = await res.json();
      onToggleParty(fullPokemon);
    } catch(err) {
      console.error(err);
    }
    setLoadingId(null);
  };

  const sortedCaptures = [...capturedPokemons].sort((a, b) => parseInt(a.id) - parseInt(b.id));

  return (
    <aside className="glass-card animate-fade" style={{ 
      position: 'sticky',
      top: '2rem',
      maxHeight: 'calc(100vh - 4rem)',
      display: 'flex', 
      flexDirection: 'column',
      background: 'rgba(30,30,30,0.6)'
    }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h2 style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle><line x1="12" y1="2" x2="12" y2="9"></line><line x1="12" y1="15" x2="12" y2="22"></line></svg>
          Mis Capturas ({capturedPokemons.length})
        </h2>
      </div>
        
        <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
          {capturedPokemons.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 0' }}>
              Aún no has capturado ningún Pokémon.
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '1rem' 
            }}>
              {sortedCaptures.map(p => {
                const inParty = !!party.find(member => member.id === p.id);
                return (
                  <div 
                    key={p.id}
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '12px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(0,0,0,0.3)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                    }}
                  >
                    {inParty && (
                      <span style={{ position: 'absolute', top: 5, left: 5, background: 'var(--type-grass)', color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '10px' }}>
                        En Equipo
                      </span>
                    )}
                    <img 
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`} 
                      alt={p.name}
                      style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                    />
                    <div style={{ fontSize: '1rem', textTransform: 'capitalize', fontWeight: '500', marginBottom: '0.2rem' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      #{p.id.toString().padStart(3, '0')}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                      <button 
                        className="btn-poke" 
                        style={{ flex: 1, padding: '4px', fontSize: '0.75rem', justifyContent: 'center' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPokemon(p.name);
                        }}
                      >
                        Detalles
                      </button>
                      <button 
                        className="btn-poke" 
                        style={{ 
                          padding: '4px', 
                          fontSize: '0.75rem', 
                          background: inParty ? 'var(--type-fire)' : 'transparent',
                          borderColor: inParty ? 'var(--type-fire)' : 'var(--text-main)',
                          color: inParty ? '#fff' : 'var(--text-main)',
                          opacity: (party.length >= 6 && !inParty) ? 0.3 : 1
                        }}
                        disabled={party.length >= 6 && !inParty}
                        onClick={(e) => handleToggle(e, p)}
                        title={inParty ? "Quitar del equipo" : "Añadir al equipo"}
                      >
                        {loadingId === p.id ? '...' : (inParty ? '-' : '+')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
    </aside>
  );
}
