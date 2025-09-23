import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const PRESET_AMOUNTS = [25, 50, 100, 250, 500, 1000, 3500];

interface AmountSelectorProps {
  onAmountChange?: (amount: number, isCustom: boolean) => void;
  selectedAmount?: number;
  customAmount?: number;
}

export function AmountSelector({ onAmountChange, selectedAmount, customAmount }: AmountSelectorProps) {
  const [activeAmount, setActiveAmount] = useState<number | null>(selectedAmount || null);
  const [customValue, setCustomValue] = useState<string>(customAmount ? customAmount.toString() : '');

  const handlePresetClick = (amount: number) => {
    setActiveAmount(amount);
    setCustomValue(''); // Clear custom amount when preset is selected
    onAmountChange?.(amount, false);
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = parseFloat(value) || 0;
    
    // Enforce maximum contribution limit of $3,500
    if (numericValue > 3500) {
      setCustomValue('3500');
      setActiveAmount(null);
      onAmountChange?.(3500, true);
      return;
    }
    
    setCustomValue(value);
    setActiveAmount(null); // Clear preset selection when custom is entered
    onAmountChange?.(numericValue, true);
  };

  return (
    <div className="amount-section space-y-4">
      <h3 className="text-lg font-semibold">Select Amount</h3>
      
      {/* Preset Amount Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {PRESET_AMOUNTS.map((amount) => (
          <Button
            key={amount}
            type="button"
            variant={activeAmount === amount ? "default" : "outline"}
            className="h-12 text-sm font-medium"
            onClick={() => handlePresetClick(amount)}
          >
            ${amount === 1000 ? '1,000' : amount === 3500 ? '3,500' : amount}
          </Button>
        ))}
        
        {/* Custom Amount Input integrated into the grid */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
            $
          </span>
          <Input
            type="number"
            placeholder="0.00"
            min="1"
            max="3500"
            step="0.01"
            value={customValue}
            onChange={handleCustomAmountChange}
            className="pl-7 h-12"
          />
        </div>
      </div>

      {/* Optional: Show selected amount clearly */}
      {(activeAmount || (customValue && parseFloat(customValue) > 0)) && (
        <div className="text-sm text-muted-foreground">
          Selected: ${activeAmount ? (activeAmount === 1000 ? '1,000' : activeAmount === 3500 ? '3,500' : activeAmount) : parseFloat(customValue || '0').toFixed(2)}
        </div>
      )}
    </div>
  );
}
