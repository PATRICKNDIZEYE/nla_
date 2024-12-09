import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { myProfile } from "@/redux/features/user/profile.slice";
import { useRouter } from "next/router";

const Spinner = dynamic(() => import("../partials/Spinner"), {
  ssr: false,
});

const LeftSideNav = dynamic(() => import("../partials/LeftSideNav"), {
  ssr: false,
});
const Header = dynamic(() => import("../partials/Header"), {
  ssr: false,
});

const DashboardLayout = ({ children }: React.PropsWithChildren) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error, data } = useAppSelector((state) => state.profile);
  useEffect(() => {
    dispatch(myProfile());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/95">
      <LeftSideNav />
      <Header />
      <div className="p-4 xl:ml-80 flex-grow flex flex-col">
        {data._id ? (
          children
        ) : loading ? (
          <Spinner />
        ) : (
          <div className="flex flex-col justify-center items-center flex-grow py-8">
            <h1 className="text-4xl font-bold">Something went wrong</h1>
            <p className="text-gray-500 mt-2">
              Please try to
              <button
                onClick={() => {
                  router.reload();
                }}
                className="text-blue-500 font-semibold hover:underline px-1"
              >
                refresh the page
              </button>
              or contact the administrator
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardLayout;
