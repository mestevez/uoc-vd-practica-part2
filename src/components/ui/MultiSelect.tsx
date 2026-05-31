import { useState, useRef, useEffect, useCallback } from 'react';

interface Props {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function MultiSelect({ label, options, selected, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = options.filter((o) => o.toLowerCase().includes(search.toLowerCase()));

  const toggle = useCallback(
    (option: string) => {
      onChange(
        selected.includes(option)
          ? selected.filter((s) => s !== option)
          : [...selected, option]
      );
    },
    [selected, onChange]
  );

  const selectAll = () => onChange(options);
  const clearAll = () => onChange([]);

  const summary =
    selected.length === 0
      ? 'Totes'
      : selected.length === 1
        ? selected[0]
        : `${selected.length} seleccionats`;

  return (
    <div className="multi-select" ref={containerRef}>
      <label className="filter-label">{label}</label>
      <button
        className={`multi-select-trigger ${open ? 'open' : ''}`}
        onClick={() => setOpen((p) => !p)}
        type="button"
      >
        <span className="multi-select-summary">{summary}</span>
        <span className="multi-select-caret">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="multi-select-dropdown">
          <input
            className="multi-select-search"
            placeholder="Cercar…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <div className="multi-select-actions">
            <button onClick={selectAll} type="button">Tots</button>
            <button onClick={clearAll} type="button">Netejar</button>
          </div>
          <ul className="multi-select-list">
            {filtered.map((option) => (
              <li key={option}>
                <label>
                  <input
                    type="checkbox"
                    checked={selected.includes(option)}
                    onChange={() => toggle(option)}
                  />
                  <span>{option}</span>
                </label>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="multi-select-empty">Sense resultats</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

