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
    value: "closed",
    label: "Closed",
  },
];

interface Props {
  onChange?: (value: string) => void;
  title?: string;
  defaultValue?: string;
  options?: { value: string; label: string }[];
}
const StatusFilter = ({
  onChange = () => {},
  title = "Dispute Status",
  defaultValue,
  options = defaultOptions,
}: Props) => {
  const { t } = useTranslation("common");
  return (
    <Select
      title={title}
      showSearch
      style={{ width: 200 }}
      placeholder={t("All Statuses")}
      optionFilterProp="children"
      filterOption={(input, option) =>
        (option?.label?.toLowerCase() ?? "").includes(input.toLowerCase())
      }
      onChange={onChange}
      options={options}
      defaultValue={defaultValue}
    />
  );
};

export default StatusFilter;
