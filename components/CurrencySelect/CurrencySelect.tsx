import { Select } from "@chakra-ui/react";

interface CurrencySelectProps {
  setCurrency: Function;
  currencies: string[];
}

const CurrencySelect = ({ setCurrency, currencies }: CurrencySelectProps) => {
  return (
    <div className="flex items-center justify-between">
      <Select
        onChange={(event) => setCurrency(event.target.value)}
        placeholder="Select"
      >
        {currencies.map((option: string, index: number) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </Select>
    </div>
  );
};

export default CurrencySelect;
