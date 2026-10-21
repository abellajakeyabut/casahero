import { createPortal } from 'react-dom';
import './Spinner.css';

const Spinner = ({ show, message = 'Please wait...' }) => {
  if (!show) return null;

  return createPortal(
    <div
      className="spinner-overlay"
      role="alertdialog"
      aria-busy="true"
      aria-live="assertive"
    >
      <div className="spinner-modal">
        <div className="spinner-ring" />
        <p className="spinner-message">{message}</p>
      </div>
    </div>,
    document.body,
  );
};

export default Spinner;
