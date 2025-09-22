import React, { useEffect, useRef, useState } from 'react';

// Minimal React wrapper to progressively migrate logic from js/widget.js.
// For now, we mount Stripe Elements and let existing DOM structure evolve later.

function DonationWidget() {
  const formRef = useRef(null);
  const cardElementRef = useRef(null);
  const [stripe, setStripe] = useState(null);
  const [elements, setElements] = useState(null);
  const cardRef = useRef(null);

  useEffect(() => {
    if (!window.Stripe) return;
    const stripeInstance = window.Stripe(window.STRIPE_PUBLISHABLE_KEY || 'pk_test_dummy_key_replace_with_real_key');
    const elementsInstance = stripeInstance.elements();
    setStripe(stripeInstance);
    setElements(elementsInstance);

    const card = elementsInstance.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#374151',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          '::placeholder': { color: '#9ca3af' },
        },
        invalid: { color: '#dc2626' },
      },
      hidePostalCode: true,
    });
    card.mount(cardElementRef.current);
    cardRef.current = card;

    return () => {
      try { card.unmount(); } catch {}
    };
  }, []);

  return (
    <div className="donation-widget">
      <div className="payment-section">
        <h3>Payment Information</h3>
        <div id="card-element" className="stripe-element" ref={cardElementRef} />
        <div id="card-errors" className="error-message" role="alert" />
      </div>
      <div className="total-section">
        <div className="stripe-badge">
          <span>Powered by</span>
          <img src="/assets/Stripe_wordmark_-_slate.svg" alt="Stripe stylized wordmark" />
        </div>
      </div>
      <p style={{marginTop: 20, color: '#6b7280'}}>
        React integration initialized. We will progressively migrate the rest of the form and logic.
      </p>
    </div>
  );
}

export default DonationWidget;

