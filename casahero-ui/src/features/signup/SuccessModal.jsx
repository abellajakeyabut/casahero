import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SuccessModal.css'; // CSS file with styles

const SuccessModal = ({ seconds = 5 }) => {
  const navi = useNavigate();
  const [count, setCount] = useState(seconds);

  useEffect(() => {
    if (count <= 0) {
      navi('/login');
      return;
    }
    const timer = setTimeout(() => setCount(count - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, navi]);

  return (
    <div className="modal-overlay">
      <div className="modal-box" role="dialog" aria-modal="true">
        <h2>Registration Successful...</h2>
        <button className="modal-button" onClick={() => navi('/login')}>
          Login again ({count})
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;
