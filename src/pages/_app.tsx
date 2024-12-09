import type { AppProps } from "next/app";
import { appWithTranslation } from "next-i18next";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import "../utils/styles/globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Inter } from "next/font/google";
import { ReactElement, ReactNode, useEffect, useMemo, useState } from "react";
import { NextPage } from "next";
import isAuth from "@/utils/helpers/isAuth";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import Secure from "@/utils/helpers/secureLS";
import Keys from "@/utils/constants/keys";
import Head from "next/head";
// import { ConfigProvider } from "antd";
import theme from "@/theme/themeConfig";

const ConfigProvider = dynamic(() => import("antd/lib/config-provider"), {
  ssr: false,
});

const Spinner = dynamic(() => import("@/components/partials/Spinner"), {
  ssr: false,
});

const SystemTourProvider = dynamic(
  () =>
    import("@/lib/systemTourProvider").then((mod) => mod.SystemTourProvider),
  { ssr: false }
);

const inter = Inter({ subsets: ["latin"] });

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const MyApp = ({ Component, pageProps }: AppPropsWithLayout) => {
  const [isLoading, setIsLoading] = useState(true);
  const authRoutes = useMemo(
    () => [
      "/login",
      "/register",
      "/forgot-password",
      "/reset-password",
      "/",
      "/requirements",
      "/faqs",
      "/tracking-case",
    ],
    []
  );

  // const systemTour = useSystemTour();
  // const newCaseTour = systemTour.getTour("new-case")?.steps ?? [];

  const getLayout = Component.getLayout || ((page) => page);
  const router = useRouter();

  useEffect(() => {
    const locale = (Secure.get(Keys.LANG_KEY) as string) ?? "en";
    if (["en", "fr", "rw"].includes(locale)) {
      router.push(router.asPath, router.asPath, { locale });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const isAuthenticated = isAuth();

    if (isAuthenticated && authRoutes.includes(router.pathname)) {
      router.replace("/home");
    } else if (
      router.pathname !== "/" &&
      !isAuthenticated &&
      !authRoutes.includes(router.pathname)
    ) {
      Secure.set(Keys.REDIRECT_TO, router.asPath);
      router.replace("/login");
    }
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />

        <title>National Land Authority</title>
        <meta
          property="og:title"
          content="National Land Authority"
          key="title"
        />
        <meta name="author" content="Rwanda Land Authority" />
        <meta
          name="description"
          content="Rwanda Dispute Land Management System"
        />
        <meta name="keywords" content="Rwanda Dispute Land Management System" />
      </Head>

      <Provider store={store}>
        <ConfigProvider theme={theme}>
          <SystemTourProvider>
            {getLayout(
              <main className={`${inter.className} antialiased`}>
                <Component {...pageProps} />
                <ToastContainer />
              </main>
            )}
          </SystemTourProvider>
        </ConfigProvider>
      </Provider>
    </>
  );
};

export default appWithTranslation(MyApp);
