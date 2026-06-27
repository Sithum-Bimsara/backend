import React, { useMemo } from "react";
import type { HotelStarRating } from "../../../types/accommodation.types";
import CustomSelect, { type SelectOption } from "../../../../../components/Common/CustomSelect";
import { Star } from "lucide-react";

const STAR_RATING_OPTIONS: HotelStarRating[] = ["N/A", "1 star", "2 stars", "3 stars", "4 stars", "5 stars"];

interface Props {
  value: HotelStarRating | null;
  onChange: (value: HotelStarRating) => void;
}

const HotelRatingSelector: React.FC<Props> = ({ value, onChange }) => {
  const selectOptions: SelectOption[] = useMemo(() => {
    return STAR_RATING_OPTIONS.map((option) => {
      if (option === "N/A") {
        return {
          value: option,
          label: "Not Applicable (N/A)",
          icon: "",
        };
      }
      const numStars = parseInt(option[0], 10);
      return {
        value: option,
        label: option,
        icon: (
      <div className="flex items-center gap-1">
        {Array.from({ length: numStars }).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
    ),
      };
    });
  }, []);

  return (
    <CustomSelect
      label="Official Star Rating"
      value={value || "N/A"}
      options={selectOptions}
      onChange={(val) => onChange(val as HotelStarRating)}
      placeholder="Select rating"
    />
  );
};

export default HotelRatingSelector;
