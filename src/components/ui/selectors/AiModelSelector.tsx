import * as React from "react";
import { cn } from '@/lib/utils';

interface AiModelSelectorProps {
  models: string[];
  value: string;
  onChange: (value: string) => void;
}

export function AiModelSelector({ models, value, onChange }: AiModelSelectorProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {models.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>
    </div>
  );
}

// Add a default export to make it easier to import
export default AiModelSelector;