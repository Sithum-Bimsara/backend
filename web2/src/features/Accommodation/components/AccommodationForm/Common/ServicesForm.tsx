import type { ServicesDto } from "../../../dtos/accommodation.dto";
import CustomSelect from "../../../../../components/Common/CustomSelect";

interface Props {
  value: ServicesDto;
  onChange: (services: ServicesDto) => void;
}

const ServicesForm: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <CustomSelect
        label="Breakfast Option"
        value={value.breakfast}
        onChange={(val) => onChange({ ...value, breakfast: val as ServicesDto["breakfast"] })}
        options={[
          { value: "no", label: "Not available" },
          { value: "yes_free", label: "Available for free" },
          { value: "yes_paid", label: "Available for a fee" },
        ]}
      />

      <CustomSelect
        label="Parking Facility"
        value={value.parking}
        onChange={(val) => onChange({ ...value, parking: val as ServicesDto["parking"] })}
        options={[
          { value: "no", label: "Not available" },
          { value: "yes_free", label: "Free on-site parking" },
          { value: "yes_paid", label: "Paid on-site parking" },
          { value: "off_site", label: "Off-site parking" },
        ]}
      />
    </div>
  );
};

export default ServicesForm;
