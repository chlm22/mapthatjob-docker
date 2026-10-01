import React, { useState, useEffect } from 'react';

export default function AccessibilityControls() {
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState('medium');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-font', fontSize);
  }, [fontSize]);

  return (
    <div className="controls-container">
      <div className="control-group">
        <h3>Theme</h3>
        <button 
          className={theme === 'light' ? 'active' : ''} 
          onClick={() => setTheme('light')}
        >
          Light
        </button>
        <button 
          className={theme === 'dark' ? 'active' : ''} 
          onClick={() => setTheme('dark')}
        >
          Dark
        </button>
      </div>

      <div className="control-group">
        <h3>Text</h3>
        <button 
          className={fontSize === 'small' ? 'active' : ''} 
          onClick={() => setFontSize('small')}
        >
          Small
        </button>
        <button 
          className={fontSize === 'medium' ? 'active' : ''} 
          onClick={() => setFontSize('medium')}
        >
          Medium
        </button>
        <button 
          className={fontSize === 'large' ? 'active' : ''} 
          onClick={() => setFontSize('large')}
        >
          Large
        </button>
      </div>
    </div>
  );
}