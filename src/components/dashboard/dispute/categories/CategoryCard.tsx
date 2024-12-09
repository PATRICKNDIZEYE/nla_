import { IDisputeCategory } from "@/@types/dispute.type";
import React from "react";
import { DeleteFilled, EditFilled } from "@ant-design/icons";
import { Button, Tooltip } from "antd";

const CategoryCard = ({
  data,
  onEdit,
  onDelete,
}: {
  data: IDisputeCategory;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  return (
    <div className="bg-white rounded bg-shades-white min-w-[389.67px] flex flex-col items-start justify-start py-10 px-6 box-border gap-[14px] text-3xl">
      <div className="self-stretch relative max-w-full overflow-hidden h-[3px] shrink-0 bg-blue-400" />
      <div className="self-stretch relative">{data.name}</div>
      <div className="self-stretch relative text-base text-neutral-500">
        {data.description}
      </div>
      <div className="flex flex-row items-start justify-start py-2 px-0 gap-[11px]">
        <Tooltip title="Edit">
          <Button
            type="text"
            shape="circle"
            icon={<EditFilled />}
            onClick={onEdit}
          />
        </Tooltip>
        <Tooltip title="Delete">
          <Button
            type="text"
            shape="circle"
            icon={<DeleteFilled />}
            onClick={onDelete}
          />
        </Tooltip>
      </div>
    </div>
  );
};

export default CategoryCard;
