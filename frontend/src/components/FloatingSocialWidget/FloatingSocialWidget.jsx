import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  FaInstagram, 
  FaWhatsapp, 
  FaTelegramPlane, 
  FaFacebookF, 
  FaHeadset, 
  FaTimes,
  FaComments
} from 'react-icons/fa';
import { SOCIAL_LINKS } from '../../utils/socialLinks';
import styles from './FloatingSocialWidget.module.css';

const SOCIAL_ITEMS = [
  {
    id: 'whatsapp-support',
    name: 'WhatsApp Support',
    icon: <FaWhatsapp />,
    url: SOCIAL_LINKS.whatsappSupport,
    color: '#25D366',
    bgColor: 'rgba(37, 211, 102, 0.15)',
    borderColor: 'rgba(37, 211, 102, 0.4)',
    glow: 'rgba(37, 211, 102, 0.4)'
  },
  {
    id: 'whatsapp-channel',
    name: 'WhatsApp Channel',
    icon: <FaWhatsapp />,
    url: SOCIAL_LINKS.whatsappChannel,
    color: '#00b0ff',
    bgColor: 'rgba(0, 176, 255, 0.15)',
    borderColor: 'rgba(0, 176, 255, 0.4)',
    glow: 'rgba(0, 176, 255, 0.4)'
  },
  {
    id: 'telegram',
    name: 'Telegram Channel',
    icon: <FaTelegramPlane />,
    url: SOCIAL_LINKS.telegram,
    color: '#0088cc',
    bgColor: 'rgba(0, 136, 204, 0.15)',
    borderColor: 'rgba(0, 136, 204, 0.4)',
    glow: 'rgba(0, 136, 204, 0.4)'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: <FaInstagram />,
    url: SOCIAL_LINKS.instagram,
    color: '#E1306C',
    bgColor: 'rgba(225, 48, 108, 0.15)',
    borderColor: 'rgba(225, 48, 108, 0.4)',
    glow: 'rgba(225, 48, 108, 0.4)'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: <FaFacebookF />,
    url: SOCIAL_LINKS.facebook,
    color: '#1877F2',
    bgColor: 'rgba(24, 119, 242, 0.15)',
    borderColor: 'rgba(24, 119, 242, 0.4)',
    glow: 'rgba(24, 119, 242, 0.4)'
  }
];

const FloatingSocialWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const widgetRef = useRef(null);

  // Hide on login and signup pages
  const hiddenRoutes = ['/login', '/signup'];
  const isHidden = hiddenRoutes.includes(location.pathname);

  // Toggle speed dial
  const toggleOpen = () => {
    setIsOpen(prev => !prev);
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Close popup if route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  if (isHidden) {
    return null;
  }

  return (
    <div className={styles.floatingContainer} ref={widgetRef} aria-label="Social and Support Links">
      {/* Backdrop overlay for focus on open */}
      {isOpen && (
        <div 
          className={styles.backdrop} 
          onClick={() => setIsOpen(false)} 
          aria-hidden="true" 
        />
      )}

      {/* Expanded Menu List */}
      <div className={`${styles.menuList} ${isOpen ? styles.menuListOpen : ''}`}>
        {SOCIAL_ITEMS.map((item, index) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.menuItem}
            style={{
              '--item-index': index,
              '--item-color': item.color,
              '--item-bg': item.bgColor,
              '--item-border': item.borderColor,
              '--item-glow': item.glow
            }}
            aria-label={item.name}
            title={item.name}
          >
            <span className={styles.itemLabel}>{item.name}</span>
            <div className={styles.iconCircle}>
              {item.icon}
            </div>
          </a>
        ))}
      </div>

      {/* Main Trigger Button */}
      <button
        type="button"
        className={`${styles.triggerButton} ${isOpen ? styles.triggerButtonOpen : ''}`}
        onClick={toggleOpen}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close social media and support menu" : "Open social media and support menu"}
      >
        <span className={styles.pulseRing}></span>
        <span className={styles.pulseRingOuter}></span>
        
        <div className={styles.buttonIconWrapper}>
          <span className={`${styles.iconContainer} ${styles.iconLauncher} ${isOpen ? styles.iconHidden : styles.iconVisible}`}>
            <FaHeadset className={styles.launcherIcon} />
          </span>
          <span className={`${styles.iconContainer} ${styles.iconClose} ${isOpen ? styles.iconVisible : styles.iconHidden}`}>
            <FaTimes className={styles.closeIcon} />
          </span>
        </div>
      </button>
    </div>
  );
};

export default FloatingSocialWidget;
