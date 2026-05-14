import React, { useState, useEffect } from 'react';

export default function ResultadosTipo({ types, onSelectPokemon }) {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!types || types.length === 0) return;
    setLoading(true);
    setPokemons([]);

    Promise.all(types.map(t => fetch(`https://pokeapi.co/api/v2/type/${t}`).then(r => r.json())))
      .then(results => {
        let intersection = null;

        results.forEach(data => {
          const typeSet = new Map();
          data.pokemon.forEach(p => {
            const urlParts = p.pokemon.url.split('/');
            const id = urlParts[urlParts.length - 2];
            typeSet.set(id, p.pokemon.name);
          });

          if (!intersection) {
            intersection = typeSet;
          } else {
            const newIntersection = new Map();
            for (let [id, name] of intersection.entries()) {
              if (typeSet.has(id)) newIntersection.set(id, name);
            }
            intersection = newIntersection;
          }
        });

        const pokes = Array.from(intersection.entries()).map(([id, name]) => ({ id, name }));
        pokes.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        setPokemons(pokes);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching types:", err);
        setLoading(false);
      });
  }, [types]);

  if (!types || types.length === 0) return null;

  const mainType = types[0];

  return (
    <div className="glass-card animate-fade" style={{ padding: '2rem', marginBottom: '2rem', borderTop: `4px solid var(--type-${mainType})` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '2rem' }}>
        <h2 style={{ textTransform: 'capitalize', color: 'var(--text-main)' }}>
          Pokémon con tipo(s)
        </h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {types.map(t => (
            <span key={t} style={{
              background: `var(--type-${t})`,
              padding: '6px 16px',
              borderRadius: '20px',
              color: '#fff',
              textTransform: 'uppercase',
              fontWeight: 'bold',
              fontSize: '1.2rem',
              boxShadow: `0 4px 10px rgba(0,0,0,0.5)`
            }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="pokeball-loader"></div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '1.5rem',
          maxHeight: '600px',
          overflowY: 'auto',
          padding: '1rem',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '16px'
        }}>
          {pokemons.map(p => (
            <div
              key={p.id}
              onClick={() => onSelectPokemon(p.name)}
              className="animate-fade"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.borderColor = `var(--type-${mainType})`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              }}
            >
              <img
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                alt={p.name}
                style={{ width: '80px', height: '80px', objectFit: 'contain' }}
              />
              <span style={{ fontSize: '0.9rem', textTransform: 'capitalize', fontWeight: 'bold', marginTop: '0.5rem' }}>
                {p.name}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>#{p.id.padStart(3, '0')}</span>
            </div>
          ))}
          {pokemons.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)' }}>
              No se encontraron Pokémon con esta combinación de tipos.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
