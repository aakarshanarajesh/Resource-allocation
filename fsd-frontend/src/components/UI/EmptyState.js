import React from 'react';
import '../styles/EmptyState.css';

const EmptyState = ({ icon, title, message, action }) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon || '📭'}</div>
      <h3 className="empty-state-title">{title || 'No Data'}</h3>
      <p className="empty-state-message">{message || 'There is no data to display.'}</p>
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
};

export default EmptyState;
