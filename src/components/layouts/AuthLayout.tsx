import Image from "next/image";

import dynamic from "next/dynamic";
import Link from "next/link";

const LanguageSwitcher = dynamic(
  () => import("@/components/partials/LanguageSwitcher"),
  { ssr: false }
);

const AuthLayout = ({ children }: React.PropsWithChildren) => {
  return (
    <div className="flex flex-wrap min-h-screen w-full content-center justify-center bg-gray-200 py-10 px-2 shadow-md">
      <div className="flex flex-wrap p-8 w-full md:max-w-sm min-h-[35rem] content-center justify-center rounded-l-md bg-white">
        <div className="w-full">
          <center>
            <Link href="/">
              <Image
                className="pointer-events-none mb-6"
                alt="NLA"
                width={200}
                height={100}
                src="/images/logo.png"
              />
            </Link>
          </center>
          {children}
          <div className="flex items-center justify-between flex-wrap gap-2 w-full cursor-pointer mt-4 text-center place-content-center place-items-center P100 text-N800">
            <a href="#" className="hover:text-blue-700">
              Terms of service
            </a>
            <a href="#" className="hover:text-blue-700">
              Privacy policy
            </a>
            <a href="#" className="hover:text-blue-700">
              Help
            </a>
          </div>
          <LanguageSwitcher />
        </div>
      </div>

      <div className="relative hidden md:flex flex-wrap w-[24rem] min-h-[35rem] content-center justify-center rounded-r-md">
        <Image
          alt="NLA"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="pointer-events-none w-full h-full bg-center bg-no-repeat bg-cover rounded-r-md"
          src="/images/nlalogin.png"
        />
      </div>
    </div>
  );
};

export default AuthLayout;
