import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/redux/store";
import { Drawer } from "antd";
import { HiMenu } from "react-icons/hi";
import { publicNavLinks } from "@/utils/constants/nav";

const PublicLeftSideNavPopup = () => {
  const [open, setOpen] = useState(false);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };
  const router = useRouter();

  const { t } = useTranslation("common");
  const { data: user } = useAppSelector((state) => state.profile);

  return (
    <>
      <button type="button" onClick={showDrawer} className="xl:hidden">
        <HiMenu size={32} />
      </button>
      <Drawer
        placement="left"
        open={open}
        onClose={onClose}
        closeIcon={null}
        className="xl:hidden p-0"
      >
        <aside className="bg-white inset-0 z-50 h-[calc(100vh)] transition-transform duration-300 xl:translate-x-0">
          <div className="relative border-b border-white/20">
            <Link
              onClick={onClose}
              className="flex items-center gap-4 py-6 px-8"
              href="/"
            >
              <center>
                <Image
                  alt="NLA"
                  height={70}
                  width={150}
                  src="/images/logo.png"
                />
              </center>
            </Link>
          </div>
          <div className="ml-4">
            <ul className="mb-4 flex flex-col gap-1">
              {publicNavLinks.map((navLink) => (
                <li key={navLink.name}>
                  <Link
                    aria-current="page"
                    className="active"
                    href={navLink.link}
                    onClick={onClose}
                  >
                    <button
                      className={`${
                        router.asPath === navLink.link
                          ? "py-3 px-4 text-[#0B60B0]"
                          : "py-3 px-4 text-[#51697F]"
                      }`}
                      type="button"
                    >
                      <p className="block antialiased font-sans text-base leading-relaxed text-inherit font-medium capitalize">
                        {navLink.name}
                      </p>
                    </button>
                  </Link>
                </li>
              ))}{" "}
            </ul>
          </div>
        </aside>
      </Drawer>
    </>
  );
};

export default PublicLeftSideNavPopup;
