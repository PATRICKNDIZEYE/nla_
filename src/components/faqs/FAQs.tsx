import { useState } from 'react';
import { AiOutlinePlus, AiOutlineMinus } from 'react-icons/ai';
import { useTranslation } from 'react-i18next';

const FAQs = () => {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqData = [
    {
      question: t("What is the Land Disputes Management System (LDMS)?"),
      answer: t(
          "The Land Disputes Management System (LDMS) is an innovative platform designed by the National Land Authority to streamline and improve the resolution process of land disputes, ensuring efficiency, transparency, and fairness."
      ),
    },
    {
      question: t("How do I track the progress of my case?"),
      answer: t(
          "You can track the progress of your case in real-time by using the 'Case Tracking' feature. Simply enter your case ID in the search bar provided to get the latest updates on your case."
      ),
    },
    {
      question: t("How can I submit a new land dispute case?"),
      answer: t(
          "To submit a new case, go to the 'Submit Case' section, fill in the required details including your personal and land information, and submit your application. Our team will review and process your case promptly."
      ),
    },
    {
      question: t("What information is required to submit a case?"),
      answer: t(
          "You will need to provide personal details (such as National ID, phone number) and land-related information (such as UPI, address of the defendant, and names under the registration of your UPI"
      ),
    },
    {
      question: t("Who can I contact for further assistance?"),
      answer: t(
          "For any further assistance, please contact our support team through the contact information provided on our website. We are here to help you with any queries or issues you may have."
      ),
    },
  ];

  return (
      <div className="flex flex-col items-center bg-gradient-to-b from-blue-100 to-white min-h-screen">
        {/* Header Section */}
        <div
            className="bg-cover bg-center w-full h-80 flex items-center justify-center"
            style={{ backgroundImage: "url(/images/home-cover.png)" }}
        >
          <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">
            {t("Frequently Asked Questions")}
          </h1>
        </div>

        {/* FAQ Section */}
        <div className="flex flex-col items-center w-full max-w-5xl px-6 py-12">
          <h2 className="text-3xl font-bold mb-10 text-blue-900">
            {t("FAQs")}
          </h2>

          {faqData.map((faq, index) => (
              <div key={index} className="w-full mb-6">
                {/* Accordion Header */}
                <div
                    className="flex justify-between items-center bg-white p-6 rounded-lg shadow-md transition-transform duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                    onClick={() => toggleAccordion(index)}
                >
                  <h3 className="text-lg font-semibold text-blue-900">
                    {faq.question}
                  </h3>
                  {activeIndex === index ? (
                      <AiOutlineMinus className="text-xl text-blue-900" />
                  ) : (
                      <AiOutlinePlus className="text-xl text-blue-900" />
                  )}
                </div>

                {/* Accordion Body */}
                {activeIndex === index && (
                    <div className="bg-white p-6 rounded-lg shadow-inner mt-2 border-t-2 border-blue-100">
                      <p className="text-gray-700">{faq.answer}</p>
                    </div>
                )}
              </div>
          ))}
        </div>
      </div>
  );
};

export default FAQs;
