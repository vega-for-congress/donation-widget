import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'DC', label: 'District of Columbia' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

interface DonorInfoProps {
  onValidationChange?: (isValid: boolean, data: any) => void;
}

export function DonorInfo({ onValidationChange }: DonorInfoProps) {
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    occupation: '',
    employer: '',
    comment: ''
  });

  // Required fields for validation
  const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zip', 'occupation', 'employer'];

  // Check if all required fields are filled
  const isValid = requiredFields.every(field => {
    const value = formData[field as keyof typeof formData];
    return value && value.toString().trim().length > 0;
  });

  // Notify parent of validation changes
  React.useEffect(() => {
    onValidationChange?.(isValid, formData);
  }, [formData, isValid, onValidationChange]);

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="donor-info-section">
      <h3 className="text-lg font-semibold">Your Information</h3>
      <small className="text-muted-foreground">*All fields required unless otherwise noted.</small>

      <div className="space-y-4">
        {/* First Name / Last Name Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            id="first-name"
            name="firstName"
            type="text"
            placeholder="First Name"
            autoComplete="given-name"
            required
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
          />
        </div>
        <div>
          <Input
            id="last-name"
            name="lastName"
            type="text"
            placeholder="Last Name"
            autoComplete="family-name"
            required
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
          />
        </div>
        </div>

        {/* Email / Phone Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
        </div>
        <div>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="Phone (US or intnl)"
            maxLength={20}
            pattern="[0-9\-\(\)\+\s\.x,]{7,20}"
            title="Phone number must be at least 7 digits (US or international format)"
            autoComplete="tel"
            required
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
          />
        </div>
        </div>

        {/* Address Row */}
      <div>
        <Input
          id="address"
          name="address"
          type="text"
          placeholder="Street address"
          autoComplete="street-address"
          required
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
        />
      </div>

        {/* City / State / ZIP Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Input
            id="city"
            name="city"
            type="text"
            placeholder="City"
            autoComplete="address-level2"
            required
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
          />
        </div>
        <div>
          <select 
            id="state"
            name="state"
            required
            autoComplete="address-level1"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            value={formData.state}
            onChange={(e) => handleInputChange('state', e.target.value)}
          >
            <option value="">Select State</option>
            {US_STATES.map((state) => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Input
            id="zip"
            name="zip"
            type="text"
            placeholder="ZIP Code"
            pattern="\d{5}(-\d{4})?"
            maxLength={10}
            title="5-digit ZIP code or ZIP+4 format (12345 or 12345-6789)"
            autoComplete="postal-code"
            required
            value={formData.zip}
            onChange={(e) => handleInputChange('zip', e.target.value)}
          />
        </div>
        </div>

        {/* Occupation / Employer Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            id="occupation"
            name="occupation"
            type="text"
            placeholder="Your occupation"
            autoComplete="organization-title"
            required
            value={formData.occupation}
            onChange={(e) => handleInputChange('occupation', e.target.value)}
          />
        </div>
        <div>
          <Input
            id="employer"
            name="employer"
            type="text"
            placeholder="Your employer"
            autoComplete="organization"
            required
            value={formData.employer}
            onChange={(e) => handleInputChange('employer', e.target.value)}
          />
        </div>
        </div>

        {/* Comment (Optional) */}
        <div>
          <Textarea
            id="comment"
            name="comment"
            placeholder="Have a message for the campaign (optional)?"
            rows={3}
            maxLength={500}
            value={formData.comment}
            onChange={(e) => handleInputChange('comment', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
