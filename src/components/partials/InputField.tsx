import React from "react";
import { useTranslation } from "react-i18next";
import { HiEye, HiEyeOff } from "react-icons/hi";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  register?: any;
}

const InputField = ({ label, error, register, name, ...rest }: Props) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const onToggle = () => setShowPassword((prev) => !prev);
  const { t } = useTranslation("common");
  return (
    <label className="flex flex-col" htmlFor={rest.id}>
      <span className="mb-2 font-semibold text-xs">{label}</span>

      <div className="relative flex items-center">
        <input
          {...register(name)}
          {...rest}
          type={showPassword ? "text" : rest.type}
          className={`block w-full rounded-full border border-gray-300 focus:border-rgba(27, 165, 132, 1)-700 focus:outline-none focus:ring-1 focus:ring-rgba(27, 165, 132, 1)-700 py-2 px-3 text-gray-500 ${
            rest.className ?? ""
          }`}
        />
        {rest.type === "password" && (
          <button
            type="button"
            className="absolute right-4 text-slate-600 cursor-pointer py-2"
            onClick={onToggle}
          >
            {showPassword ? <HiEye size={24} /> : <HiEyeOff size={24} />}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-500 mt-1">{t(error as any)}</p>}
    </label>
  );
};

export default InputField;
