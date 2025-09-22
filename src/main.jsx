import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import '../css/widget.css';

// Get the root element and render the React app
const root = ReactDOM.createRoot(document.getElementById('root'));

// Add Stripe configuration from environment (injected by server or dev mode)
window.STRIPE_PUBLISHABLE_KEY = window.STRIPE_PUBLISHABLE_KEY || 'pk_test_dummy_key_replace_with_real_key';

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
