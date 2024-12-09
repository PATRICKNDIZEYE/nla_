import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useTranslation } from "react-i18next";

const Home = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  const { t } = useTranslation("common");

  return (
      <>
        <div className="bg-[#FAFCFE] min-h-screen overflow-x-hidden">
          <div className="min-h-[40vh]">
            <Slider {...settings}>
              <div className="relative flex items-center justify-center min-h-[40vh] bg-[url('/images/slide1.jpg')] bg-cover bg-center">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-green-900"></div>
                <div className="relative z-10 text-center flex flex-col items-center justify-center mt-20">
                  <h1 className="text-4xl md:text-5xl font-bold tracking-wide text-white">
                    {t("Welcome to LDMS")}
                  </h1>
                  <p className="mt-3 text-lg max-w-4xl text-white leading-relaxed">
                    {t("The Land Disputes Management System (LDMS) is here to streamline land dispute resolutions.")}
                  </p>
                </div>
              </div>
              <div className="relative flex items-center justify-center min-h-[40vh] bg-[url('/images/slide2.jpg')] bg-cover bg-center">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-green-900"></div>
                <div className="relative z-10 text-center flex flex-col items-center justify-center mt-20">
                  <h1 className="text-4xl md:text-5xl font-bold tracking-wide text-white">
                    {t("Efficient and Transparent")}
                  </h1>
                  <p className="mt-3 text-lg max-w-4xl text-white leading-relaxed">
                    {t("Ensuring transparent and efficient handling of land-related conflicts.")}
                  </p>
                </div>
              </div>
              <div className="relative flex items-center justify-center min-h-[40vh] bg-[url('/images/slide3.jpeg')] bg-cover bg-center">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-green-900"></div>
                <div className="relative z-10 text-center flex flex-col items-center justify-center mt-20">
                  <h1 className="text-4xl md:text-5xl font-bold tracking-wide text-white">
                    {t("User-Friendly")}
                  </h1>
                  <p className="mt-3 text-lg max-w-4xl text-white leading-relaxed">
                    {t("Providing a seamless, transparent, and user-friendly experience for all stakeholders.")}
                  </p>
                </div>
              </div>
            </Slider>
          </div>
          <div className="flex flex-col items-center bg-[#FAFCFE] py-6 sm:py-12">
            <div className="flex flex-col w-full text-sm max-w-7xl px-4">
              <h2 className="text-2xl font-bold text-center">{t("About LDMS")}</h2>
              <div className="mt-10 text-xs p-1 rounded-full bg-[#E5EDFF] w-fit mx-auto">{t("About LDMS")}</div>
              <div className="bg-white p-6 mt-8 rounded-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <div className="flex flex-col md:flex-row items-center md:items-start">
                  <img src="/images/about-ldms.jpeg" alt="About LDMS" className="w-full md:w-1/2 rounded-lg shadow-lg mb-6 md:mb-0 md:mr-6" />
                  <div className="flex flex-col">
                    <p className="text-sm leading-loose tracking-wide max-w-4xl mx-auto">
                      {t("The Land Disputes Management System (LDMS) is an innovative platform developed by the National Land Authority to revolutionize the way land disputes are handled. In a rapidly growing nation, the efficient and fair resolution of land disputes is crucial for maintaining social harmony and fostering economic development. LDMS aims to provide a seamless, transparent, and user-friendly experience for all stakeholders involved in land-related conflicts.")}
                    </p>
                    <p className="mt-4 text-sm leading-loose tracking-wide max-w-4xl mx-auto">
                      {t("Whether you're a landowner, a legal professional, or a government official, LDMS offers a comprehensive suite of tools and resources designed to streamline the dispute resolution process. By leveraging cutting-edge technology, LDMS ensures that every case is handled with the utmost integrity, accuracy, and speed. Our commitment is to uphold justice and equity in land management through a system that prioritizes accessibility, efficiency, and transparency.")}
                    </p>
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-center mt-12">{t("LDMS")}</h2>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto gap-x-20">
                <div className="flex items-start gap-2 bg-white p-4 rounded-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <div className="rounded-xl bg-[#f0f9ff] p-2">🗂️</div>
                  <div className="flex flex-col">
                    <h3 className="text-lg font-semibold">{t("Centralized Database")}</h3>
                    <p className="text-sm">{t("A comprehensive repository for all land dispute cases.")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-white p-4 rounded-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <div className="rounded-xl bg-[#f0f9ff] p-2">🔎</div>
                  <div className="flex flex-col">
                    <h3 className="text-lg font-semibold">{t("Case Tracking")}</h3>
                    <p className="text-sm">{t("Monitor the progress of your case in real-time.")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-white p-4 rounded-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <div className="rounded-xl bg-[#f0f9ff] p-2">📕</div>
                  <div className="flex flex-col">
                    <h3 className="text-lg font-semibold">{t("Document Management")}</h3>
                    <p className="text-sm">{t("Upload and access all relevant documents securely.")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-white p-4 rounded-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <div className="rounded-xl bg-[#f0f9ff] p-2">🔔</div>
                  <div className="flex flex-col">
                    <h3 className="text-lg font-semibold">{t("Automated Notifications")}</h3>
                    <p className="text-sm">{t("Stay informed with updates on your case status.")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-white p-4 rounded-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <div className="rounded-xl bg-[#f0f9ff] p-2">🌐</div>
                  <div className="flex flex-col">
                    <h3 className="text-lg font-semibold">{t("Accessibility")}</h3>
                    <p className="text-sm">{t("Easy access to case information and status from anywhere, at any time.")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-white p-4 rounded-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <div className="rounded-xl bg-[#f0f9ff] p-2">🛡️</div>
                  <div className="flex flex-col">
                    <h3 className="text-lg font-semibold">{t("Security")}</h3>
                    <p className="text-sm">{t("Safeguard your data with robust security measures.")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
  );
};

export default Home;
