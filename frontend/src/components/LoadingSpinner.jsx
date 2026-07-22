const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="loading-spinner-wrapper">
      <div className="premium-spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring delay-1"></div>
        <div className="spinner-ring delay-2"></div>
        <div className="spinner-core"></div>
      </div>
      {text && <p className="spinner-text">{text}</p>}
      <style>{`
        .loading-spinner-wrapper {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 200px;
          gap: 1.5rem;
        }
        .premium-spinner {
          position: relative;
          width: 60px;
          height: 60px;
        }
        .spinner-ring {
          position: absolute;
          inset: 0;
          border: 2px solid transparent;
          border-radius: 50%;
          border-top-color: #6366f1;
          animation: spinnerRotate 1.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
        }
        .spinner-ring.delay-1 {
          inset: 6px;
          border-top-color: #06b6d4;
          animation-duration: 2s;
          animation-direction: reverse;
        }
        .spinner-ring.delay-2 {
          inset: 12px;
          border-top-color: #8b5cf6;
          animation-duration: 2.5s;
        }
        .spinner-core {
          position: absolute;
          inset: 20px;
          background: radial-gradient(circle, rgba(99,102,241,0.3), transparent);
          border-radius: 50%;
          animation: spinnerPulse 2s ease-in-out infinite;
        }
        .spinner-text {
          color: #94a3b8;
          font-size: 0.88rem;
          font-weight: 500;
          letter-spacing: 0.04em;
          animation: fadeInOut 2s ease-in-out infinite;
        }
        @keyframes spinnerRotate {
          to { transform: rotate(360deg); }
        }
        @keyframes spinnerPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
