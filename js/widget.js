// Donation Widget JavaScript
class DonationWidget {
    constructor() {
        // Get Stripe publishable key from environment or use dummy key
        this.stripePublishableKey = window.STRIPE_PUBLISHABLE_KEY || 'pk_test_dummy_key_replace_with_real_key';
        this.stripe = null;
        this.elements = null;
        this.paymentElement = null;
        this.linkAuthElement = null;
        this.addressElement = null;

        // State
        this.selectedAmount = 0;
        this.customAmount = 0;
        this.donationType = 'one-time';
        this.coverProcessingFee = true;
        this.processingFeeAmount = 0;
        this.totalAmount = 0;

        // Element validation state
        this.paymentComplete = false;
        this.addressComplete = false;
        this.linkAuthComplete = false;

        // Values collected from Stripe Elements (for server-side metadata)
        this.linkAuthEmail = '';
        this.addressValues = {};

        // Processing fee calculation (typical rates: 2.9% + $0.30)
        this.processingFeeRate = 0.029;
        this.processingFeeFixed = 0.30;

        // Federal contribution limit
        this.maxContributionAmount = 3500;

        this.init();
    }

    async init() {
        try {
            // Initialize Stripe
            this.stripe = Stripe(this.stripePublishableKey);

            // Initialize Elements with deferred intent (amount set later via updateTotals)
            this.elements = this.stripe.elements({
                mode: 'payment',
                amount: 100, // minimum placeholder in cents, updated dynamically
                currency: 'usd',
                appearance: {
                    theme: 'stripe',
                    variables: {
                        colorPrimary: '#FF1D2A',
                        colorText: '#374151',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                        borderRadius: '4px',
                    },
                },
            });

            // Setup Stripe Elements
            this.setupStripeElements();

            // Setup event listeners
            this.setupEventListeners();

            // Clear any browser-retained form values (prevents refresh issues)
            this.clearFormOnLoad();

            // Handle URL parameters for pre-filling amounts
            this.handleUrlParameters();

            // Add development-only preview option
            this.addDevelopmentPreview();

            // Add environment indicator for non-production environments
            this.addEnvironmentIndicator();

            // Initial calculations
            this.updateTotals();

        } catch (error) {
            console.error('Error initializing donation widget:', error);
            this.showError('Failed to initialize payment system. Please refresh and try again.');
        }
    }

    setupStripeElements() {
        // 1. Link Authentication Element — email field that triggers Link auto-fill
        this.linkAuthElement = this.elements.create('linkAuthentication');
        this.linkAuthElement.mount('#link-authentication-element');

        this.linkAuthElement.on('change', (event) => {
            this.linkAuthComplete = event.complete;
            this.linkAuthEmail = event.value?.email || '';
            this.updateDonateButton();
        });

        // 2. Address Element — billing name, phone, and address (auto-filled by Link)
        this.addressElement = this.elements.create('address', {
            mode: 'billing',
            fields: {
                phone: 'always',
            },
            display: {
                name: 'split',
            },
            defaultValues: {
                address: {
                    country: 'US',
                },
            },
        });
        this.addressElement.mount('#address-element');

        this.addressElement.on('change', (event) => {
            this.addressComplete = event.complete;
            if (event.value) {
                this.addressValues = event.value;
            }
            this.updateDonateButton();
        });

        // 3. Payment Element — card input with Link shown prominently
        this.paymentElement = this.elements.create('payment', {
            layout: {
                type: 'tabs',
                defaultCollapsed: false,
            },
        });
        this.paymentElement.mount('#payment-element');

        this.paymentElement.on('change', (event) => {
            this.paymentComplete = event.complete;
            const displayError = document.getElementById('card-errors');
            if (event.error) {
                displayError.textContent = event.error.message;
            } else {
                displayError.textContent = '';
            }
            this.updateDonateButton();
        });
    }

    setupEventListeners() {
        // Amount buttons
        document.querySelectorAll('.amount-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectAmount(btn);
            });
        });

        // Custom amount input
        const customAmountInput = document.getElementById('custom-amount-input');
        customAmountInput.addEventListener('input', () => {
            this.clearSelectedAmountButtons();
            this.handleCustomAmount();
        });

        // Donation type buttons (ActBlue style)
        document.querySelectorAll('.donation-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectDonationType(btn);
            });
        });

        // Also handle radio button changes directly (for accessibility)
        document.querySelectorAll('input[name="donation-type"]').forEach(radio => {
            radio.addEventListener('change', () => {
                this.donationType = radio.value;
                this.updateDonateButton();
                // Update visual state of buttons
                this.updateDonationTypeButtons();
            });
        });

        // Processing fee checkbox
        document.getElementById('cover-processing-fee').addEventListener('change', (e) => {
            this.coverProcessingFee = e.target.checked;
            this.updateTotals();
        });

        // FEC fields (occupation, employer) validation
        document.querySelectorAll('#occupation, #employer').forEach(input => {
            input.addEventListener('input', () => {
                this.updateDonateButton();
            });
        });

        // Form submission
        document.getElementById('donation-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    }

    selectAmount(button) {
        // Clear other selections
        this.clearSelectedAmountButtons();
        document.getElementById('custom-amount-input').value = '';
        this.customAmount = 0;

        // Select this button
        button.classList.add('selected');
        this.selectedAmount = parseFloat(button.dataset.amount);

        this.updateTotals();
    }

    handleCustomAmount() {
        const input = document.getElementById('custom-amount-input');
        const value = parseFloat(input.value) || 0;

        this.clearSelectedAmountButtons();
        this.selectedAmount = 0;

        if (value > 0) {
            this.customAmount = value;
        } else {
            this.customAmount = 0;
        }

        this.updateTotals();
    }

    clearSelectedAmountButtons() {
        document.querySelectorAll('.amount-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
    }

    selectDonationType(button) {
        // Clear other selections
        document.querySelectorAll('.donation-type-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Select this button
        button.classList.add('active');

        // Update the radio button
        const radioInput = button.querySelector('input[type="radio"]');
        if (radioInput) {
            radioInput.checked = true;
            this.donationType = radioInput.value;
        }

        this.updateDonateButton();
    }

    updateDonationTypeButtons() {
        // Update visual state based on selected radio button
        document.querySelectorAll('.donation-type-btn').forEach(btn => {
            const radioInput = btn.querySelector('input[type="radio"]');
            if (radioInput && radioInput.checked) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    handleUrlParameters() {
        // Parse URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const amountParam = urlParams.get('amount');

        if (amountParam) {
            // Convert from cents to dollars
            const amountInCents = parseInt(amountParam);
            const amountInDollars = amountInCents / 100;

            // Validate the amount
            if (amountInCents > 0 && amountInDollars >= 1) {
                console.log(`Pre-filling amount from URL: $${amountInDollars} (${amountInCents} cents)`);

                // Check if this amount matches any preset buttons
                const presetAmounts = [25, 50, 100, 250, 500, 1000];

                if (presetAmounts.includes(amountInDollars)) {
                    // Select the matching preset button (this calls updateTotals internally)
                    const matchingButton = document.querySelector(`[data-amount="${amountInDollars}"]`);
                    if (matchingButton) {
                        this.selectAmount(matchingButton);
                        console.log(`Selected preset button: $${amountInDollars}`);
                    }
                } else {
                    // Use custom amount
                    this.clearSelectedAmountButtons();
                    this.selectedAmount = 0;
                    this.customAmount = amountInDollars;

                    // Fill in the custom amount input
                    const customAmountInput = document.getElementById('custom-amount-input');
                    customAmountInput.value = amountInDollars.toFixed(2);

                    // Update totals for custom amounts (preset amounts are handled by selectAmount)
                    this.updateTotals();

                    console.log(`Set custom amount: $${amountInDollars}`);
                }
            } else {
                console.warn(`Invalid amount parameter: ${amountParam}. Amount must be at least 100 cents ($1.00)`);
            }
        }
    }

    calculateProcessingFee(amount) {
        if (amount <= 0) return 0;
        return Math.round((amount * this.processingFeeRate + this.processingFeeFixed) * 100) / 100;
    }

    // Calculate what total amount needs to be charged to net a specific amount after Stripe fees
    calculateTotalForDesiredNet(desiredNetAmount) {
        if (desiredNetAmount <= 0) return 0;
        
        // We need to solve: totalAmount - (totalAmount * rate + fixed) = desiredNetAmount
        // Rearranging: totalAmount * (1 - rate) - fixed = desiredNetAmount
        // So: totalAmount = (desiredNetAmount + fixed) / (1 - rate)
        const totalAmount = (desiredNetAmount + this.processingFeeFixed) / (1 - this.processingFeeRate);
        
        return Math.round(totalAmount * 100) / 100;
    }

    updateTotals() {
        const baseAmount = this.selectedAmount || this.customAmount || 0;
        let processingFeeAmount = 0;
        let totalAmount = baseAmount;
        let canCoverFee = true;

        // First check if base amount exceeds the limit
        if (baseAmount > this.maxContributionAmount) {
            // Base amount exceeds limit - don't allow this
            this.showContributionLimitError(baseAmount);
            return;
        } else {
            this.clearContributionLimitError();
        }

        if (this.coverProcessingFee && baseAmount > 0) {
            // Calculate what total amount needs to be charged so that baseAmount is netted
            const requiredTotalAmount = this.calculateTotalForDesiredNet(baseAmount);
            const requiredProcessingFee = requiredTotalAmount - baseAmount;

            // Check if covering the required fee would exceed the contribution limit
            if (requiredTotalAmount > this.maxContributionAmount) {
                // Can only cover partial fee to stay within limit
                const maxAllowedTotal = this.maxContributionAmount;
                processingFeeAmount = maxAllowedTotal - baseAmount;
                canCoverFee = false;

                console.log(`Partial fee coverage: donation ${baseAmount}, max total allowed ${maxAllowedTotal}, required total ${requiredTotalAmount}`);
            } else {
                // Can cover the full fee needed to net the desired amount
                processingFeeAmount = requiredProcessingFee;
                console.log(`Full fee coverage: donation ${baseAmount}, processing fee ${processingFeeAmount}, total ${requiredTotalAmount} will net ${baseAmount}`);
            }
        }

        totalAmount = baseAmount + processingFeeAmount;

        // Update state
        this.processingFeeAmount = processingFeeAmount;
        this.totalAmount = totalAmount;

        // Sync amount to Stripe Elements (in cents, minimum 100)
        const amountInCents = Math.max(Math.round(totalAmount * 100), 100);
        try {
            this.elements.update({ amount: amountInCents });
        } catch (e) {
            // Elements may not be ready yet during init
            console.log('Elements amount update deferred:', e.message);
        }

        // Update display
        document.getElementById('donation-amount-display').textContent = this.formatCurrency(baseAmount);
        document.getElementById('processing-fee-display').textContent = this.formatCurrency(processingFeeAmount);
        document.getElementById('total-amount-display').textContent = this.formatCurrency(totalAmount);

        // Update fee amount in checkbox label
        document.querySelector('.fee-amount').textContent = `(${this.formatCurrency(processingFeeAmount)})`;

        // Update checkbox state and disable it if at exactly $3,500
        this.updateProcessingFeeCheckbox(baseAmount, canCoverFee);

        this.updateDonateButton();
    }

    updateProcessingFeeCheckbox(baseAmount, canCoverFee) {
        const checkbox = document.getElementById('cover-processing-fee');
        const checkboxLabel = checkbox.closest('.checkbox-label');
        const feeHelpText = document.querySelector('.fee-help');

        if (baseAmount >= this.maxContributionAmount) {
            // At maximum contribution - disable fee coverage
            checkbox.disabled = true;
            checkbox.checked = false;
            this.coverProcessingFee = false;
            checkboxLabel.style.opacity = '0.5';
            feeHelpText.textContent = 'Fee coverage not available at maximum contribution limit';
            feeHelpText.style.color = '#6b7280';
        } else if (!canCoverFee && this.coverProcessingFee) {
            // Partial fee coverage situation
            checkbox.disabled = false;
            checkboxLabel.style.opacity = '1';
            
            // Calculate what the full fee would be if we could charge the required total
            const requiredTotalAmount = this.calculateTotalForDesiredNet(baseAmount);
            const idealProcessingFee = requiredTotalAmount - baseAmount;
            const actualProcessingFee = this.processingFeeAmount;
            const uncoveredFee = idealProcessingFee - actualProcessingFee;
            
            feeHelpText.innerHTML = `Covering ${this.formatCurrency(actualProcessingFee)} of ${this.formatCurrency(idealProcessingFee)} fee (${this.formatCurrency(uncoveredFee)} not covered due to contribution limit)`;
            feeHelpText.style.color = '#6b7280';
        } else {
            // Normal state
            checkbox.disabled = false;
            checkboxLabel.style.opacity = '1';
            feeHelpText.textContent = '100% of your donation goes to the campaign';
            feeHelpText.style.color = '#6b7280';
        }
    }

    showContributionLimitError(amount) {
        // Show error near the amount input instead of scrolling down
        const errorMsg = `Maximum contribution is ${this.formatCurrency(this.maxContributionAmount)} per election. Amount adjusted to ${this.formatCurrency(this.maxContributionAmount)}.`;
        this.showAmountError(errorMsg);

        // Reset to maximum allowed amount
        if (this.customAmount > 0) {
            const customAmountInput = document.getElementById('custom-amount-input');
            customAmountInput.value = this.maxContributionAmount.toFixed(2);
            this.customAmount = this.maxContributionAmount;
        } else {
            // Clear preset selection and set custom amount to max
            this.clearSelectedAmountButtons();
            this.selectedAmount = 0;
            this.customAmount = this.maxContributionAmount;
            const customAmountInput = document.getElementById('custom-amount-input');
            customAmountInput.value = this.maxContributionAmount.toFixed(2);
        }

        // Recalculate with corrected amount
        setTimeout(() => this.updateTotals(), 100);
    }

    showAmountError(message) {
        // Show error near the amount section without scrolling
        let errorElement = document.getElementById('amount-error');
        if (!errorElement) {
            // Create error element if it doesn't exist
            errorElement = document.createElement('div');
            errorElement.id = 'amount-error';
            errorElement.className = 'amount-error-message';

            // Insert after the amount section
            const amountSection = document.querySelector('.amount-section');
            amountSection.appendChild(errorElement);
        }

        errorElement.textContent = message;
        errorElement.style.display = 'block';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (errorElement) {
                errorElement.style.display = 'none';
            }
        }, 5000);
    }

    clearAmountError() {
        const errorElement = document.getElementById('amount-error');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    clearContributionLimitError() {
        // Clear any existing error messages
        const errorElement = document.getElementById('card-errors');
        if (errorElement.textContent.includes('Maximum contribution')) {
            errorElement.textContent = '';
        }

        // Also clear the amount error message
        this.clearAmountError();
    }

    clearFormOnLoad() {
        // Clear our custom form inputs to prevent browser auto-fill issues on refresh
        // (Stripe Elements handle their own state)
        const occupation = document.getElementById('occupation');
        const employer = document.getElementById('employer');
        const comment = document.getElementById('comment');
        if (occupation) occupation.value = '';
        if (employer) employer.value = '';
        if (comment) comment.value = '';

        // Specifically clear custom amount input
        const customAmountInput = document.getElementById('custom-amount-input');
        if (customAmountInput) {
            customAmountInput.value = '';
        }

        // Clear any selected amount buttons
        this.clearSelectedAmountButtons();

        // Reset state variables
        this.selectedAmount = 0;
        this.customAmount = 0;
        this.processingFeeAmount = 0;
        this.totalAmount = 0;

        // Reset donation type to default (one-time)
        const oneTimeRadio = document.querySelector('input[name="donation-type"][value="one-time"]');
        if (oneTimeRadio) {
            oneTimeRadio.checked = true;
            this.donationType = 'one-time';
        }

        // Update donation type button visual state
        this.updateDonationTypeButtons();

        console.log('Form cleared on page load');
    }

    addDevelopmentPreview() {
        // Only show if explicitly enabled by server AND running on localhost
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const previewEnabled = window.ENABLE_PREVIEW_MODE === true;

        if (!isLocalhost || !previewEnabled) {
            return;
        }

        // Create preview button
        const previewButton = document.createElement('button');
        previewButton.type = 'button';
        previewButton.className = 'dev-preview-btn';
        previewButton.textContent = '🎯 Preview Confirmation Page (Dev Only)';
        previewButton.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #f59e0b;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 8px 12px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            z-index: 1000;
            transition: background-color 0.2s;
        `;

        previewButton.addEventListener('mouseenter', () => {
            previewButton.style.backgroundColor = '#d97706';
        });

        previewButton.addEventListener('mouseleave', () => {
            previewButton.style.backgroundColor = '#f59e0b';
        });

        previewButton.addEventListener('click', () => {
            this.previewConfirmationPage();
        });

        document.body.appendChild(previewButton);

        console.log('🛠️ Development preview button added (localhost only)');
    }

    addEnvironmentIndicator() {
        // Check if environment info is available
        if (!window.ENVIRONMENT_INFO) {
            return;
        }

        const env = window.ENVIRONMENT_INFO;
        
        // Only show indicator for non-production environments
        if (env.isProduction) {
            return;
        }

        // Log environment information
        console.log('🛠️ Environment:', env.type);
        console.log('🔑 Stripe mode:', env.isTestMode ? 'TEST' : 'LIVE');
        
        // Create environment indicator banner
        const banner = document.createElement('div');
        banner.id = 'environment-indicator';
        
        let bannerText = '';
        let bannerColor = '';
        
        if (env.type === 'local-dev') {
            bannerText = '🛠️ LOCAL DEVELOPMENT MODE';
            bannerColor = '#1f2937'; // Dark gray
        } else if (env.type === 'railway-dev') {
            bannerText = '🚧 DEVELOPMENT ENVIRONMENT';
            bannerColor = '#dc2626'; // Red
        }
        
        if (env.isTestMode) {
            bannerText += ' • STRIPE TEST MODE';
        }
        
        banner.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: ${bannerColor};
            color: white;
            text-align: center;
            padding: 8px 16px;
            font-size: 14px;
            font-weight: 600;
            z-index: 9999;
            border-bottom: 2px solid rgba(255,255,255,0.2);
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        `;
        
        banner.textContent = bannerText;
        
        // Insert banner at the top of the page
        document.body.insertBefore(banner, document.body.firstChild);
        
        // Adjust body padding to account for banner
        document.body.style.paddingTop = (banner.offsetHeight + 10) + 'px';
        
        // Add warning to page title for dev environments
        if (!env.isProduction) {
            document.title = '[DEV] ' + document.title;
        }
        
        console.log(`🚨 Development environment indicator added: ${bannerText}`);
    }

    previewConfirmationPage() {
        console.log('🎯 Previewing confirmation page with current form data');

        // Get current form data or use demo data
        const formData = this.getFormDataForPreview();

        // Temporarily set totalAmount if not set
        const originalTotalAmount = this.totalAmount;
        if (this.totalAmount <= 0) {
            this.totalAmount = 25.75; // Demo amount with fee
            this.donationType = 'one-time';
        }

        // Show success page with demo data
        this.showSuccess(formData, true);

        // Restore original amount
        this.totalAmount = originalTotalAmount;

        // Add a "Back to Form" button for preview mode
        this.addBackToFormButton();
    }

    getFormDataForPreview() {
        // Try to get real form data from Stripe Elements and custom fields
        const addr = this.addressValues || {};
        const name = addr.name || {};
        const address = addr.address || {};

        return {
            firstName: name.firstName || name.first_name || 'Jane',
            lastName: name.lastName || name.last_name || 'Smith',
            email: this.linkAuthEmail || 'jane.smith@example.com',
            phone: addr.phone || '(555) 123-4567',
            address: address.line1 || '123 Main Street',
            city: address.city || 'Anytown',
            state: address.state || 'CA',
            zip: address.postal_code || '90210',
            occupation: document.getElementById('occupation').value.trim() || 'Software Engineer',
            employer: document.getElementById('employer').value.trim() || 'Tech Company Inc.',
            comment: document.getElementById('comment').value.trim() || '',
            donationType: this.donationType,
            donationAmount: this.selectedAmount || this.customAmount || 25,
            processingFeeAmount: this.processingFeeAmount || 1.03,
            totalAmount: this.totalAmount || 26.03
        };
    }

    addBackToFormButton() {
        const successMessage = document.getElementById('success-message');

        // Remove existing back button if present
        const existingBackButton = successMessage.querySelector('.back-to-form-btn');
        if (existingBackButton) {
            existingBackButton.remove();
        }

        // Create back button
        const backButton = document.createElement('button');
        backButton.type = 'button';
        backButton.className = 'back-to-form-btn';
        backButton.textContent = '← Back to Form (Preview Mode)';
        backButton.style.cssText = `
            background: #6b7280;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 10px 20px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            margin-top: 20px;
            transition: background-color 0.2s;
        `;

        backButton.addEventListener('mouseenter', () => {
            backButton.style.backgroundColor = '#4b5563';
        });

        backButton.addEventListener('mouseleave', () => {
            backButton.style.backgroundColor = '#6b7280';
        });

        backButton.addEventListener('click', () => {
            // Show form again
            const form = document.getElementById('donation-form');
            const successMessage = document.getElementById('success-message');

            form.style.display = 'block';
            successMessage.style.display = 'none';

            console.log('📝 Returned to form from preview mode');
        });

        successMessage.appendChild(backButton);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    }

    updateDonateButton() {
        const button = document.getElementById('donate-button');
        const buttonText = document.getElementById('button-text');

        const hasAmount = this.totalAmount > 0;
        const hasPayment = this.paymentComplete;
        const hasAddress = this.addressComplete;
        const hasEmail = this.linkAuthComplete;
        const hasFecFields = this.validateFecFields();

        const isValid = hasAmount && hasPayment && hasAddress && hasEmail && hasFecFields;

        button.disabled = !isValid;

        // Update button text
        if (hasAmount) {
            if (this.donationType === 'monthly') {
                buttonText.textContent = `Donate ${this.formatCurrency(this.totalAmount)} monthly`;
            } else {
                buttonText.textContent = `Donate ${this.formatCurrency(this.totalAmount)} now`;
            }
        } else {
            buttonText.textContent = 'Enter amount to donate';
        }
    }

    validateFecFields() {
        const occupation = document.getElementById('occupation');
        const employer = document.getElementById('employer');
        return occupation.value.trim() !== '' && employer.value.trim() !== '';
    }

    async handleSubmit() {
        if (this.totalAmount <= 0) {
            this.showError('Please select a donation amount.');
            return;
        }

        // Show loading state
        this.setLoadingState(true);

        try {
            // Validate Stripe Elements first
            const { error: submitError } = await this.elements.submit();
            if (submitError) {
                console.error('Elements validation failed:', submitError);
                this.showError(submitError.message);
                this.setLoadingState(false);
                return;
            }

            // Get form data (merges Stripe Element values + our custom fields)
            const formData = this.getFormData();

            // Create payment intent on server
            const { clientSecret } = await this.createPaymentIntent(formData);

            console.log('Confirming payment with Stripe...');

            // Confirm payment using Payment Element
            const { error: confirmError } = await this.stripe.confirmPayment({
                elements: this.elements,
                clientSecret,
                confirmParams: {
                    return_url: window.location.href,
                },
                redirect: 'if_required',
            });

            if (confirmError) {
                console.error('Payment failed:', confirmError);
                this.showError(confirmError.message);
                this.setLoadingState(false);
            } else {
                console.log('Payment succeeded');
                this.showSuccess();
            }

        } catch (error) {
            console.error('Payment error:', error);
            this.showError('Payment failed. Please try again.');
            this.setLoadingState(false);
        }
    }

    getFormData() {
        // Extract billing details from Stripe Address Element values
        const addr = this.addressValues || {};
        const name = addr.name || {};
        const address = addr.address || {};

        return {
            firstName: name.firstName || name.first_name || '',
            lastName: name.lastName || name.last_name || '',
            email: this.linkAuthEmail || '',
            phone: addr.phone || '',
            address: address.line1 || '',
            city: address.city || '',
            state: address.state || '',
            zip: address.postal_code || '',
            occupation: document.getElementById('occupation').value.trim(),
            employer: document.getElementById('employer').value.trim(),
            comment: document.getElementById('comment').value.trim(),
            emailOptIn: document.getElementById('email-optin').checked,
            amount: Math.round(this.totalAmount * 100), // Convert to cents
            donationAmount: Math.round((this.selectedAmount || this.customAmount) * 100),
            processingFee: Math.round(this.processingFeeAmount * 100),
            donationType: this.donationType,
            coverProcessingFee: this.coverProcessingFee,
        };
    }

    async createPaymentIntent(formData) {
        // This is a mock implementation - replace with actual server endpoint
        // In a real implementation, you would call your server to create a PaymentIntent

        const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            throw new Error('Failed to create payment intent');
        }

        return await response.json();
    }

    setLoadingState(loading) {
        const button = document.getElementById('donate-button');
        const buttonText = document.getElementById('button-text');
        const spinner = document.getElementById('spinner');

        if (loading) {
            button.disabled = true;
            buttonText.style.display = 'none';
            spinner.style.display = 'block';
        } else {
            this.updateDonateButton(); // This will set the correct disabled state
            buttonText.style.display = 'block';
            spinner.style.display = 'none';
        }
    }

    showSuccess() {
        const form = document.getElementById('donation-form');
        const successMessage = document.getElementById('success-message');

        form.style.display = 'none';
        successMessage.style.display = 'block';

        // Optional: Track the donation for analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'donation', {
                'event_category': 'engagement',
                'event_label': this.donationType,
                'value': this.totalAmount
            });
        }
    }

    showError(message) {
        // You can customize this to show errors in a more user-friendly way
        const errorElement = document.getElementById('card-errors');
        errorElement.textContent = message;

        // Scroll to error
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

}

// Initialize widget when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if Stripe key is provided
    if (!window.STRIPE_PUBLISHABLE_KEY) {
        console.warn('STRIPE_PUBLISHABLE_KEY not found. Using dummy key. Set window.STRIPE_PUBLISHABLE_KEY to use real Stripe integration.');
    }

    new DonationWidget();
});

// Export for embedding
window.DonationWidget = DonationWidget;
