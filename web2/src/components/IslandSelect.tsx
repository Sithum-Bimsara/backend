import React from "react";
import CustomSelect from "./Common/CustomSelect";
import { MALDIVES_ISLANDS } from "../constants/islands";

interface IslandSelectProps {
  value: string | null;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  valueFormat?: "name" | "name-atoll";
  searchable?: boolean;
}

const IslandSelect: React.FC<IslandSelectProps> = ({
  value,
  onChange,
  label = "Island *",
  placeholder = "Select Island",
  disabled = false,
  error,
  valueFormat = "name-atoll",
  searchable = true,
}) => {
  const options = [...MALDIVES_ISLANDS]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((island) => ({
      value: valueFormat === "name" ? island.name : `${island.name} (${island.atoll})`,
      label: island.name,
      description: island.atoll,
    }));

  return (
    <CustomSelect
      label={label}
      placeholder={placeholder}
      searchable={searchable}
      value={value}
      onChange={onChange}
      options={options}
      disabled={disabled}
      error={error}
    />
  );
};

export default IslandSelect;
