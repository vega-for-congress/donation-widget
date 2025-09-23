import React, { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';

interface ProcessingFeeProps {
  donationAmount: number;
  onFeeChange?: (feeAmount: number, coverProcessingFee: boolean) => void;
  initialChecked?: boolean;
}

export function ProcessingFee({ donationAmount, onFeeChange, initialChecked = true }: ProcessingFeeProps) {
  const [coverProcessingFee, setCoverProcessingFee] = useState(initialChecked);
  const [processingFeeAmount, setProcessingFeeAmount] = useState(0);
  const [helpText, setHelpText] = useState('100% of your donation goes to the campaign');
  const [isDisabled, setIsDisabled] = useState(false);

  // Stripe fee constants (typical rates: 2.9% + $0.30)
  const processingFeeRate = 0.029;
  const processingFeeFixed = 0.30;
  const maxContributionAmount = 3500;

  // Calculate what total amount needs to be charged to net a specific amount after Stripe fees
  const calculateTotalForDesiredNet = (desiredNetAmount: number): number => {
    if (desiredNetAmount <= 0) return 0;
    
    // We need to solve: totalAmount - (totalAmount * rate + fixed) = desiredNetAmount
    // Rearranging: totalAmount * (1 - rate) - fixed = desiredNetAmount
    // So: totalAmount = (desiredNetAmount + fixed) / (1 - rate)
    const totalAmount = (desiredNetAmount + processingFeeFixed) / (1 - processingFeeRate);
    
    return Math.round(totalAmount * 100) / 100;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  useEffect(() => {
    let feeAmount = 0;
    let canCoverFee = true;
    let newHelpText = '100% of your donation goes to the campaign';
    let disabled = false;

    if (donationAmount >= maxContributionAmount) {
      // At maximum contribution - disable fee coverage
      disabled = true;
      setCoverProcessingFee(false);
      newHelpText = 'Fee coverage not available at maximum contribution limit';
    } else if (coverProcessingFee && donationAmount > 0) {
      // Calculate what total amount needs to be charged so that donationAmount is netted
      const requiredTotalAmount = calculateTotalForDesiredNet(donationAmount);
      const requiredProcessingFee = requiredTotalAmount - donationAmount;

      // Check if covering the required fee would exceed the contribution limit
      if (requiredTotalAmount > maxContributionAmount) {
        // Can only cover partial fee to stay within limit
        const maxAllowedTotal = maxContributionAmount;
        feeAmount = maxAllowedTotal - donationAmount;
        canCoverFee = false;

        // Calculate what the full fee would be if we could charge the required total
        const idealProcessingFee = requiredProcessingFee;
        const actualProcessingFee = feeAmount;
        const uncoveredFee = idealProcessingFee - actualProcessingFee;
        
        newHelpText = `Covering ${formatCurrency(actualProcessingFee)} of ${formatCurrency(idealProcessingFee)} fee (${formatCurrency(uncoveredFee)} not covered due to contribution limit)`;
      } else {
        // Can cover the full fee needed to net the desired amount
        feeAmount = Math.round(requiredProcessingFee * 100) / 100;
        newHelpText = '100% of your donation goes to the campaign';
      }
    }

    setProcessingFeeAmount(feeAmount);
    setHelpText(newHelpText);
    setIsDisabled(disabled);
    onFeeChange?.(feeAmount, coverProcessingFee);
  }, [donationAmount, coverProcessingFee, onFeeChange]);

  const handleCheckboxChange = (checked: boolean) => {
    if (!isDisabled) {
      setCoverProcessingFee(checked);
    }
  };

  return (
    <div className="processing-fee-section space-y-2">
      <label 
        className={`flex items-start space-x-3 cursor-pointer ${isDisabled ? 'opacity-50' : ''}`}
      >
        <Checkbox
          checked={coverProcessingFee}
          onCheckedChange={handleCheckboxChange}
          disabled={isDisabled}
          className="mt-0.5"
        />
        <div className="flex-1">
          <div className="fee-text text-sm">
            Cover the processing fee{' '}
            <span className="fee-amount font-medium">
              ({formatCurrency(processingFeeAmount)})
            </span>
          </div>
          <div className="fee-help text-xs text-muted-foreground mt-1">
            {helpText}
          </div>
        </div>
      </label>
    </div>
  );
}
