import React from "react";
import { Select } from "antd";
import { useTranslation } from "react-i18next";

const defaultOptions = [
  {
    value: "",
    label: "All Statuses",
  },
  {
    value: "open",
    label: "Open",
  },
  {
    value: "processing",
    label: "Processing",
  },
  {
    value: "resolved",
    label: "Resolved",
  },
  {
    value: "rejected",
    label: "Rejected",
  },
  {
    value: "appealed",
    label: "Appealed",
  },
  {
    value: "withdrawn",
    label: "Withdrawn",
  },
  {
    value: "closed",
    label: "Closed",
  },
];

interface Props {
  onChange?: (value: string) => void;
  title?: string;
  defaultValue?: string;
  options?: { value: string; label: string }[];
  className?: string;
}

const StatusFilter = ({
  onChange = () => {},
  title = "Dispute Status",
  defaultValue = "",
  options = defaultOptions,
  className = "",
}: Props) => {
  const { t } = useTranslation("common");

  const handleChange = (value: string) => {
    console.log('Status filter changed to:', value);
    onChange(value);
  };

  return (
    <Select
      title={title}
      showSearch
      className={`min-w-[200px] ${className}`}
      placeholder={t("All Statuses")}
      optionFilterProp="children"
      filterOption={(input, option) =>
        (option?.label?.toLowerCase() ?? "").includes(input.toLowerCase())
      }
      onChange={handleChange}
      options={options.map(opt => ({
        ...opt,
        label: t(opt.label)
      }))}
      defaultValue={defaultValue}
      allowClear
    />
  );
};

export default StatusFilter;
