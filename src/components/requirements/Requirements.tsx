import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FaSpinner } from 'react-icons/fa';
import { useTranslation } from 'next-i18next';

const Requirements = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const [form, setForm] = useState({
    nationalId: false,
    defendantAddress: false,
    phoneNumber: false,
    multipleUpi: false,
    upi: false,
    defendantNames: false,
    knowUpi: false,
    namesRegistration: false,
    message: '',
  });

  const questions = [
    { key: 'nationalId', label: 'Do you have a National ID?' },
    { key: 'defendantAddress', label: 'Do you know the defendant\'s address?' },
    { key: 'phoneNumber', label: 'Do you have a phone number?' },
    { key: 'multipleUpi', label: 'Do you have multiple UPIs?' },
    { key: 'upi', label: 'Do you have a UPI?' },
    { key: 'defendantNames', label: 'Do you have a UPI?' },
    { key: 'knowUpi', label: 'Do you know the defendant names?' },
    { key: 'namesRegistration', label: 'Did you get an appointment message?' },
  ];

  const handleChange = (e) => {
    const { id, checked, value, type } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  const isFormValid = Object.values(form).every((value) =>
      typeof value === 'boolean' ? value : true
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid) {
      setShowSuccess(true);
      setRedirecting(true);
      setTimeout(() => {
        router.push('/register');
      }, 3000);
    } else {
      alert(t('Please check all required fields.'));
    }
  };

  useEffect(() => {
    return () => {
      setShowSuccess(false);
      setRedirecting(false);
    };
  }, []);

  return (
      <div className="flex flex-col items-center bg-[#FAFCFE] min-h-screen">
        <div
            className="bg-cover bg-center w-full h-60 flex items-center justify-center"
            style={{ backgroundImage: "url(/images/home-cover.png)" }}
        >
          <h1 className="text-4xl font-bold text-white">{t('Requirements')}</h1>
        </div>

        <div className="flex flex-col items-center w-full max-w-4xl px-4 py-8">
          <h2 className="text-2xl font-bold mb-6">
            {t('Requirements before registration and submission of a land dispute case')}
          </h2>

          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg w-full">
            <h3 className="text-xl font-semibold mb-4">{t('Personal Information')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {questions.map((question) => (
                  <div key={question.key}>
                    <input
                        type="checkbox"
                        id={question.key}
                        checked={form[question.key]}
                        onChange={handleChange}
                        className="hidden"
                    />
                    <label
                        htmlFor={question.key}
                        className={`flex items-center cursor-pointer ${
                            form[question.key] ? 'text-blue-600' : 'text-gray-700'
                        } transition-colors duration-300`}
                    >
                      <div
                          className={`w-6 h-6 border ${
                              form[question.key] ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                          } rounded-md flex items-center justify-center mr-2`}
                      >
                        {form[question.key] && (
                            <svg
                                className="w-4 h-4 text-white fill-current"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                            </svg>
                        )}
                      </div>
                      {t(question.label)}
                    </label>
                  </div>
              ))}
            </div>

            <div className="mt-4">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                {t("Don't have some? Drop us a message")}
              </label>
              <textarea
                  id="message"
                  rows="3"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  value={form.message}
                  onChange={handleChange}
              ></textarea>
            </div>

            <button
                type="submit"
                className={`mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 ${
                    isFormValid ? '' : 'cursor-not-allowed opacity-50'
                }`}
                disabled={!isFormValid}
            >
              {t('Submit')}
            </button>
          </form>
        </div>

        {showSuccess && (
            <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4 flex items-center justify-center flex-col">
                <FaSpinner className="w-12 h-12 text-green-500 animate-spin mb-4" />
                <p className="text-lg font-semibold text-center text-green-600 mt-4">
                  {t('Congratulations!')}
                </p>
                {redirecting && (
                    <p className="text-sm text-gray-700 text-center mt-2">
                      {t('Analysing your inputs.')}
                    </p>
                )}
              </div>
            </div>
        )}
      </div>
  );
};

export default Requirements;
