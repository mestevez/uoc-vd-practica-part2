interface Props {
  label: string;
  min: number;
  max: number;
  value: [number, number];
  onChange: (v: [number, number]) => void;
}

export default function RangeSlider({ label, min, max, value, onChange }: Props) {
  const [lo, hi] = value;

  const handleMin = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.min(+e.target.value, hi - 1);
    onChange([v, hi]);
  };

  const handleMax = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.max(+e.target.value, lo + 1);
    onChange([lo, v]);
  };

  const loPercent = ((lo - min) / (max - min)) * 100;
  const hiPercent = ((hi - min) / (max - min)) * 100;

  return (
    <div className="range-slider">
      <label className="filter-label">{label}</label>
      <div className="range-slider-track-wrap">
        <div className="range-slider-track">
          <div
            className="range-slider-fill"
            style={{ left: `${loPercent}%`, width: `${hiPercent - loPercent}%` }}
          />
        </div>
        <input
          type="range"
          className="range-thumb range-thumb-lo"
          min={min}
          max={max}
          value={lo}
          onChange={handleMin}
        />
        <input
          type="range"
          className="range-thumb range-thumb-hi"
          min={min}
          max={max}
          value={hi}
          onChange={handleMax}
        />
      </div>
      <div className="range-slider-values">
        <span>{lo} €</span>
        <span>{hi} €</span>
      </div>
    </div>
  );
}

