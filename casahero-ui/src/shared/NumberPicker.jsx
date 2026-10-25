import './NumberPicker.css';

// -/+ stepper for small whole-number counts (beds, baths).
// With allowAny, null means "Any" and sits below min; values display as "n+".
const NumberPicker = ({ id, label, value, onChange, min = 1, max = 10, allowAny = false }) => {
  const isAny = value === null || value === undefined;
  const atBottom = allowAny ? isAny : value <= min;
  const atTop = !isAny && value >= max;

  const decrease = () => onChange(allowAny && value <= min ? null : Math.max(min, value - 1));
  const increase = () => onChange(isAny ? min : Math.min(max, value + 1));

  const display = isAny ? 'Any' : allowAny ? `${value}+` : value;

  return (
    <div className="search-input number-picker">
      <span className="number-picker-label">{label}</span>
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        onClick={decrease}
        disabled={atBottom}
      >
        −
      </button>
      <span id={id} className="number-picker-value" aria-live="polite">{display}</span>
      <button
        type="button"
        aria-label={`Increase ${label}`}
        onClick={increase}
        disabled={atTop}
      >
        +
      </button>
    </div>
  );
};
export default NumberPicker
