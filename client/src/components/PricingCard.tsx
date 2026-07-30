import { useLanguage } from '@/hooks/useLanguage';
import { convertCurrency, formatPrice } from '@/lib/currencyConverter';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface PricingCardProps {
  title: string;
  basePrice: number;
  baseCurrency?: string;
  billingPeriod?: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  onCTA?: () => void;
}

export function PricingCard({
  title,
  basePrice,
  baseCurrency = 'USD',
  billingPeriod = 'month',
  features,
  cta,
  highlighted = false,
  onCTA,
}: PricingCardProps) {
  const { currency, t } = useLanguage();
  const convertedPrice = convertCurrency(basePrice, baseCurrency, currency);
  const formattedPrice = formatPrice(convertedPrice, currency);

  return (
    <div
      className={`rounded-lg border-2 p-6 transition-all ${
        highlighted
          ? 'border-emerald-500 bg-emerald-50 shadow-lg'
          : 'border-gray-200 bg-white hover:border-emerald-300'
      }`}
    >
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      
      <div className="mb-4">
        <span className="text-4xl font-bold text-emerald-600">{formattedPrice}</span>
        <span className="text-gray-600 ml-2">/{billingPeriod}</span>
      </div>

      <button
        onClick={onCTA}
        className={`w-full py-2 px-4 rounded-lg font-medium mb-6 transition-colors ${
          highlighted
            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
        }`}
      >
        {cta}
      </button>

      <ul className="space-y-3">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
