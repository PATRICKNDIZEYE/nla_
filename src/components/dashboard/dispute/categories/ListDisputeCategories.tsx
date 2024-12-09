import React from "react";
import { Button, Form, Input, Modal } from "antd";
import { IDisputeCategory } from "@/@types/dispute.type";
import CategoryCard from "./CategoryCard";
import axiosInstance from "@/utils/config/axios.config";
import { IDataResponse } from "@/@types/pagination";
import { toast } from "react-toastify";
import { useForm } from "antd/es/form/Form";
import Spinner from "@/components/partials/Spinner";
import { PlusOutlined } from "@ant-design/icons";

interface ICurrent {
  item: IDisputeCategory | null;
  action: "edit" | "delete" | "add" | null;
}

const ListDisputeCategories = () => {
  const [form] = useForm();
  const [isLoading, setIsLoading] = React.useState(false);
  const [data, setData] = React.useState<IDisputeCategory[]>([]);
  const [current, setCurrent] = React.useState<ICurrent>({
    item: null,
    action: null,
  });

  const onFetchData = async () => {
    setIsLoading(true);
    try {
      const { data } = await axiosInstance.get<
        IDataResponse<IDisputeCategory[]>
      >("/system/dispute-categories");
      setData(data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onAction = async (current: ICurrent) => {
    if (!current.item || isLoading) return;
    setCurrent(current);
    setIsLoading(true);
    try {
      if (current.action === "edit") {
        const { data: result } = await axiosInstance.put<IDisputeCategory>(
          `/system/dispute-categories/${current.item._id}`,
          current.item
        );
        toast.success("Category updated successfully");
        setData((prev) => {
          return prev.map((item) => {
            if (item._id === result._id) {
              return result;
            }
            return item;
          });
        });
        setCurrent({ item: null, action: null });
      } else if (current.action === "delete") {
        await axiosInstance.delete<IDisputeCategory>(
          `/system/dispute-categories/${current.item._id}`
        );
        toast.success("Category deleted successfully");
        setData((prev) => {
          return prev.filter((item) => item._id !== current.item?._id);
        });
        setCurrent({ item: null, action: null });
      } else if (current.action === "add") {
        const { data: result } = await axiosInstance.post<IDisputeCategory>(
          `/system/dispute-categories`,
          current.item
        );
        toast.success("Category added successfully");
        setData((prev) => [result, ...prev]);
        setCurrent({ item: null, action: null });
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message;
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (item: IDisputeCategory) => {
    Modal.error({
      title: "Delete category",
      content: "Are you sure you want to delete this category?",
      onOk: () => onAction({ item, action: "delete" }),
      open: current.action === "delete" && current.item?._id === item._id,
      okButtonProps: {
        loading: isLoading && current.action === "delete",
        danger: true,
        disabled: isLoading,
      },
      okText: "Delete",
      cancelText: "Cancel",
    });
  };

  React.useEffect(() => {
    onFetchData();
  }, []);

  return (
    <>
      <div className="flex items-center justify-between py-4 px-0 gap-[4px] text-[24px]">
        <p className="">Dispute categories</p>
        <Button
          type="primary"
          className="bg-blue-500"
          onClick={() => {
            setCurrent({
              item: null,
              action: "add",
            });
          }}
          icon={<PlusOutlined />}
        >
          Add category
        </Button>
      </div>
      {isLoading && !data.length ? (
        <Spinner />
      ) : (
        !data.length && <p className="to-brand-gray text-sm">No data</p>
      )}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-8">
        {data.map((item) => (
          <CategoryCard
            key={item._id}
            onDelete={() => handleDelete(item)}
            onEdit={() => {
              setCurrent({ item, action: "edit" });
            }}
            data={item}
          />
        ))}
      </div>

      <Modal
        title={current?.action === "add" ? "Add category" : "Edit category"}
        open={!!current?.action && ["add", "edit"].includes(current.action)}
        onOk={() => {
          form.submit();
        }}
        onCancel={() => {
          setCurrent({ item: null, action: null });
        }}
        okButtonProps={{
          loading:
            isLoading &&
            !!current.action &&
            ["add", "edit"].includes(current.action),
          disabled: isLoading,
          className: "bg-blue-500",
        }}
        okText={current?.action === "add" ? "Add" : "Update"}
        cancelText="Cancel"
      >
        <Form
          form={form}
          onFinish={(values) => {
            if (current && current.action === "edit") {
              values._id = current.item?._id;
            }
            onAction({ item: values, action: current.action });
          }}
          initialValues={current.item ?? undefined}
          className="mt-4"
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please input category name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: "Please input category description" },
            ]}
          >
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ListDisputeCategories;
