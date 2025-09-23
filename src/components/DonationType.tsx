import React, { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type DonationType = 'monthly' | 'one-time';

interface DonationTypeProps {
  onTypeChange?: (type: DonationType) => void;
  selectedType?: DonationType;
}

export function DonationType({ onTypeChange, selectedType = 'monthly' }: DonationTypeProps) {
  const [donationType, setDonationType] = useState<DonationType>(selectedType);

  const handleTypeChange = (value: string) => {
    const type = value as DonationType;
    setDonationType(type);
    onTypeChange?.(type);
  };

  return (
    <div className="donation-type-section space-y-4">
      <h3 className="text-lg font-semibold">Make it monthly!</h3>

      <RadioGroup
        value={donationType}
        onValueChange={handleTypeChange}
        className="grid grid-cols-2 gap-3"
      >
        {/* Monthly Option */}
        <label
          className={`donation-type-btn relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${donationType === 'monthly'
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-gray-200 hover:border-gray-300'
            }`}
        >
          <RadioGroupItem value="monthly" id="monthly" className="sr-only" />
          <div className="text-center">
            <div className="font-medium">
              Yes, count me in!
            </div>
          </div>
        </label>

        {/* One-time Option */}
        <label
          className={`donation-type-btn relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${donationType === 'one-time'
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-gray-200 hover:border-gray-300'
            }`}
        >
          <RadioGroupItem value="one-time" id="one-time" className="sr-only" />
          <div className="text-center">
            <div className="font-medium">
              No, donate once
            </div>
          </div>
        </label>
      </RadioGroup>
    </div>
  );
}
