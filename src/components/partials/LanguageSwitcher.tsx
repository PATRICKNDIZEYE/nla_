import { useState } from "react";
import { languages } from "@/utils/constants/languages";
import { Popover } from "antd";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import Secure from "@/utils/helpers/secureLS";
import Keys from "@/utils/constants/keys";

export default function LanguageSwitcher({ className = "mt-4" }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <Popover
        content={languages
          .filter((item) => item.code !== router.locale)
          .map((item) => (
            <Link
              key={item.code}
              locale={item.code}
              href={router.asPath}
              className="flex items-center cursor-pointer py-1"
              onClick={() => {
                setOpen(false);
                Secure.set(Keys.LANG_KEY, item.code);
              }}
            >
              <p className="P100 text-N800">
                {item.name}({item.code.toUpperCase()})
              </p>
            </Link>
          ))}
        trigger="click"
        open={open}
        onOpenChange={setOpen}
        className="flex justify-center items-center cursor-pointer"
      >
        <button
          type="button"
          title={languages.find((item) => item.code === router.locale)?.name}
          className="inline-block py-2 space-x-1 px-3 hover:bg-gray-200 rounded-full relative "
        >
          <Image
            src={`/images/flags/${router.locale ?? "en"}.svg`}
            alt="Language"
            width={16}
            height={16}
          />
          <span className="font-medium">
            {languages.find((item) => item.code === router.locale)?.name ??
              "English"}
          </span>
        </button>
      </Popover>
    </div>
  );
}
