import { FiArrowUp, FiMail, FiMap, FiPhoneCall } from "react-icons/fi";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
// import LanguageSwitcher from "../partials/LanguageSwitcher";
// import PublicLeftSideNavPopup from "../partials/PublicLeftSideNav";
import React from "react";
// import { publicNavLinks } from "@/utils/constants/nav";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";


const LanguageSwitcher = dynamic(
  () => import("@/components/partials/LanguageSwitcher"),
  { ssr: false }
);

const PublicLeftSideNavPopup = dynamic(
  () => import("@/components/partials/PublicLeftSideNav"),
  { ssr: false }
);



const MAX_OFFSET = 100;

interface Props {
  children: React.ReactNode;
}
const PublicLayout = ({ children }: Props) => {
  const [scrollY, setScrollY] = React.useState(0);
  const { t } = useTranslation("common");
  const { pathname } = useRouter();

  const publicNavLinks = [
    {
      name: t("Home"),
      link: "/",
    },
    {
      name: t('Requirements'),
      link: "/requirements",
    },
    {
      name: t('Tracking Case'),
      link: "/tracking-case",
    },
    {
      name: t('FAQs'),
      link: "/faqs",
    },
  ];

  const onMoveTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  React.useEffect(() => {
    const onScroll = () => {
      const { scrollY } = window;
      setScrollY(scrollY);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      <div className="flex flex-col items-center bg-[#FAFCFE] ">
        <div className="flex items-center justify-end gap-3 flex-wrap py-1 w-full text-sm max-w-7xl px-4">
          <a
            href="tel:2142"
            className="flex items-center space-x-2 text-[#51697F]"
          >
            <FiPhoneCall className="text-[#0B60B0]" />
            <span className="text-[#51697F]">2142</span>
          </a>
          <a
            href="mail:info@lands.rw"
            className="flex items-center space-x-2 text-[#51697F]"
          >
            <FiMail className="text-[#0B60B0]" />
            <span className="text-[#51697F]">info@lands.rw</span>
          </a>
          <a
            href="https://maps.app.goo.gl/c9hauqLWTtcakDBF6"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-[#51697F]"
          >
            <FiMap className="text-[#0B60B0]" />
            <span className="text-[#51697F]">Kigali, Kigali city</span>
          </a>
        </div>
      </div>

      <div className="flex flex-col items-center bg-white">
        <div className="flex items-center gap-3 py-1 w-full text-sm max-w-7xl px-4">
          <Link className="hidden md:flex text-gray-500 py-2" href="/">
            <Image alt="NLA" height={40} width={80} src="/images/logo.png" />
          </Link>
          <PublicLeftSideNavPopup />
          <div className="flex-1 flex py-3 items-center justify-end gap-3 md:gap-x-8 lg:gap-x-12">
            {publicNavLinks.map((navLink) => (
              <Link
                key={navLink.name}
                href={navLink.link}
                className={`${
                  pathname === navLink.link
                    ? "text-[#0B60B0]"
                    : "text-[#51697F]"
                } hidden md:flex`}
              >
                {navLink.name}
              </Link>
            ))}
            <div className="flex items-center space-x-4 ml-auto md:ml-0">
              <LanguageSwitcher className="mt-0" />
              <Link
                href="/login"
                className="text-white bg-[#2563EB] border px-6 py-2 rounded-full"
              >
                {t("login")}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {children}

      <div className="flex flex-col items-center bg-[#0A142F] py-8 md:py-12 text-white">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 flex-wrap py-1 w-full text-sm max-w-7xl px-4">
          <div className="flex flex-col gap-3">
            <Link className="hidden md:flex text-gray-500 py-2" href="/">
              <Image alt="NLA" height={40} width={80} src="/images/logo.png" />
            </Link>
            <p className="max-w-xs w-60 text-xs leading-relaxed tracking-wide text-[#51697F]">
              The National Land Authority (NLA) was established by the
              Presidential Order No 030/01 of 06/05/2022
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-white font-bold">{t('Links')}</h3>
            <div className="flex flex-col gap-y-3">
              <a
                href="#"
                className="flex items-center space-x-2 text-[#51697F] hover:text-gray-200"
              >
                Smart Admin
              </a>
              <a
                href="#"
                className="flex items-center space-x-2 text-[#51697F] hover:text-gray-200"
              >
                BPMIS
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-[#51697F]  hover:text-gray-200"
              >
                Irembo
              </a>

              <a
                href="#"
                className="flex items-center space-x-2 text-[#51697F] hover:text-gray-200"
              >
                Land Information Portal & e-title
              </a>
              <a
                href="#"
                className="flex items-center space-x-2 text-[#51697F] hover:text-gray-200"
              >
                NSDI Hub - geodata.rw
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-white font-bold">{t('Contact Us')}</h3>
            <div className="flex flex-col gap-y-3">
              <a
                href="tel:2142"
                className="flex items-center space-x-2 text-[#51697F] hover:text-gray-200"
              >
                <FiPhoneCall className="text-[#0B60B0]" />
                <span className="text-[#51697F] hover:text-gray-200">2142</span>
              </a>
              <a
                href="mail:info@lands.rw"
                className="flex items-center space-x-2 text-[#51697F]"
              >
                <FiMail className="text-[#0B60B0]" />
                <span className="text-[#51697F] hover:text-gray-200">
                  info@lands.rw
                </span>
              </a>
              <a
                href="https://maps.app.goo.gl/c9hauqLWTtcakDBF6"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-[#51697F]"
              >
                <FiMap className="text-[#0B60B0]" />
                <span className="text-[#51697F] hover:text-gray-200">
                  Kigali, Kigali city
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {scrollY > MAX_OFFSET ? (
        <a
          href="#back-top"
          onClick={onMoveTop}
          className="
        flex
        items-center
        justify-center
        bg-primary
        text-white
        w-10
        h-10
        rounded-full
        fixed
        bottom-24
        right-8
        left-auto
        z-[999]
        back-to-top
        shadow-md
        transition
        duration-300
        ease-in-out
        bg-[#0081FE]
      "
        >
          {/* <span className="w-3 h-3 border-t border-l border-white rotate-45 mt-[6px]" />s */}
          <FiArrowUp className="w-5 h-5" />
          <p className="sr-only">Back Top</p>
        </a>
      ) : null}
    </>
  );
};

export default PublicLayout;
