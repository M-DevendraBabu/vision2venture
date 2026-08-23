import { useState, useEffect } from 'react';
import { FiDownload, FiX, FiSmartphone } from 'react-icons/fi';
import '../../styles/InstallAppPrompt.css';

const InstallAppPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if already in standalone/installed mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isStandalone) {
      return;
    }

    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for beforeinstallprompt (Android / Chrome / Desktop)
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Don't show immediately, show after 3 seconds for better UX
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // If iOS and not dismissed in session
    if (isIosDevice && !sessionStorage.getItem('v2v_ios_prompt_dismissed')) {
      setTimeout(() => setShowPrompt(true), 4000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('v2v_ios_prompt_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <>
      <div className="install-app-banner animate-fade-in">
        <div className="install-app-content">
          <div className="install-app-icon">
            <FiSmartphone />
          </div>
          <div className="install-app-text">
            <h4>Install Vision2Venture App</h4>
            <p>Faster analysis, instant notifications & offline support</p>
          </div>
        </div>
        <div className="install-app-actions">
          <button className="btn-install-app" onClick={handleInstallClick}>
            <FiDownload /> Install
          </button>
          <button className="btn-close-prompt" onClick={handleDismiss} title="Dismiss">
            <FiX />
          </button>
        </div>
      </div>

      {showIOSGuide && (
        <div className="ios-guide-modal-overlay" onClick={() => setShowIOSGuide(false)}>
          <div className="ios-guide-card glass-card" onClick={(e) => e.stopPropagation()}>
            <h3>📲 Install on iPhone / iPad</h3>
            <ol>
              <li>Tap the <strong>Share</strong> button (square with arrow icon) in Safari.</li>
              <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
              <li>Tap <strong>"Add"</strong> in the top right corner.</li>
            </ol>
            <button className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => setShowIOSGuide(false)}>
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallAppPrompt;
