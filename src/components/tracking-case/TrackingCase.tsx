import { getDisputeById } from "@/redux/features/dispute/dispute.slice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AiOutlineSearch,
  AiOutlineInfoCircle,
  AiOutlineIdcard,
  AiOutlineFileText,
} from "react-icons/ai";
import { FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";

const TrackingCase = () => {
  const { t } = useTranslation("common");
  const [caseId, setCaseId] = useState("");
  const [caseInfo, setCaseInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState(""); // Error message for invalid search
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.dispute);

  // Helper function to validate case ID
  const isValidCaseId = (id) => {
    const caseIdRegex = /^[A-Za-z0-9_-]+$/; // Update regex as per your case ID format
    return caseIdRegex.test(id);
  };

  const handleSearch = async () => {
    setErrorMessage(""); // Clear any previous error
    if (!isValidCaseId(caseId)) {
      setErrorMessage(t("Invalid case ID format. Please check and try again."));
      return;
    }

    try {
      const { data } = await dispatch(getDisputeById(caseId)).unwrap();
      setCaseInfo({
        id: caseId,
        status: data.status?.toUpperCase(),
        description: t("Your case is currently {{status}}.", {
          status: data.status?.toUpperCase(),
        }),
      });
      toast.success(t("Case found successfully."));
    } catch (error) {
      setCaseInfo(null); // Clear previous case info
      const err = error as Error;
      toast.error(t("An error occurred: {{message}}", { message: err.message }));
    }
  };

  return (
      <div className="flex flex-col items-center bg-[#FAFCFE] min-h-screen">
        {/* Header Section */}
        <div
            className="bg-cover bg-center w-full h-60 flex items-center justify-center"
            style={{ backgroundImage: "url(/images/home-cover.png)" }}
        >
          <h1 className="text-4xl font-bold text-white">
            {t("Case Tracking")}
          </h1>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center w-full max-w-4xl px-4 py-8">
          <form
              onSubmit={(event) => {
                event.preventDefault();
                handleSearch();
              }}
              className="flex items-center w-full max-w-2xl mx-auto mb-8"
          >
            <input
                type="text"
                placeholder={t("Search with your case ID")}
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                aria-label={t("Enter your case ID")}
                className="w-full px-4 py-2 rounded-l-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
            <button
                type="submit"
                disabled={loading || !caseId.length}
                aria-label={t("Search button")}
                className="disabled:cursor-not-allowed flex items-center bg-blue-600 text-white px-4 py-2 rounded-r-full outline-none focus:outline-none hover:bg-blue-700 transition duration-300"
            >
              {!loading ? (
                  <AiOutlineSearch className="mr-2" />
              ) : (
                  <FaSpinner className="animate-spin mr-2" />
              )}
              {t("Search")}
            </button>
          </form>

          {/* Error Message */}
          {errorMessage && (
              <div className="text-red-600 text-sm mb-4">{errorMessage}</div>
          )}

          {/* Case Information */}
          {caseInfo ? (
              <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-2xl">
                <h3 className="text-xl font-bold mb-4">{t("Case Information")}</h3>
                <div className="flex items-center mb-2">
                  <AiOutlineIdcard className="text-gray-700 mr-2" />
                  <p className="text-lg">
                    <strong>{t("ID")}:</strong> {caseInfo.id}
                  </p>
                </div>
                <div className="flex items-center mb-2">
                  <AiOutlineInfoCircle className="text-gray-700 mr-2" />
                  <p className="text-lg">
                    <strong>{t("Status")}:</strong> {caseInfo.status}
                  </p>
                </div>
                <div className="flex items-center">
                  <AiOutlineFileText className="text-gray-700 mr-2" />
                  <p className="text-lg">
                    <strong>{t("Description")}:</strong> {caseInfo.description}
                  </p>
                </div>
              </div>
          ) : (
              !loading &&
              !errorMessage && (
                  <p className="text-gray-600 text-center">
                    {t("No case information available. Please search using a valid ID.")}
                  </p>
              )
          )}
        </div>
      </div>
  );
};

export default TrackingCase;
