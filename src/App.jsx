import React from 'react';
import DonationWidget from './components/DonationWidget';

function App() {
    return (
        <>
            <div className="logo">
                <a href="https://votevega.nyc/">
                    <img src="/assets/vega-red-black.png" alt="Vega for Congress" />
                </a>
            </div>
            <div className="page-header">
                <h1>Support our campaign.</h1>
                <p>Help keep us independent. We take no corporate money. We're only backed by people like you.</p>
            </div>
            <DonationWidget />
            <footer
                style={{
                    textAlign: 'center',
                    padding: '20px',
                    marginTop: '30px',
                    borderTop: '1px solid #eee',
                    background: '#f9f9f9'
                }}
            >
                <p>
                    <a href="privacy.html" style={{ color: 'var(--primaryColor)', textDecoration: 'none', margin: '0 10px' }}>
                        Privacy Policy
                    </a> |
                    <a href="terms.html" style={{ color: 'var(--primaryColor)', textDecoration: 'none', margin: '0 10px' }}>
                        Terms of Service
                    </a>
                </p>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                    Paid for by Vega for Congress. Not authorized by any candidate or candidate's committee.
                </p>
            </footer>
        </>
    );
}

export default App;
