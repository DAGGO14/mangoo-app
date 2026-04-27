import React from 'react';
import { useApp } from '../context/AppContext';
export default function Toasts() {
  const { toasts } = useApp();
  return (
    <div className="toast-wrap">
      {toasts.map(t => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}
    </div>
  );
}
