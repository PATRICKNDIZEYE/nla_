import { QueryParams } from "@/@types/pagination";

export function generateOTP(limit = 6): string {
  const digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < limit; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}

export function formatPhoneNumber(phoneNumber: string) {
  const digits = phoneNumber.replace(/\D/g, "");

  if (digits.length !== 10) {
    return "";
  }

  return `+25${digits.slice(0, 1)} ${digits.slice(1, 4)} ${digits.slice(
    4,
    7
  )} ${digits.slice(7)}`;
}

export function convertStringToPositiveNumbers(
  inputString: string,
  count = 10
) {
  const result = [];

  for (let i = 0; i < Math.min(inputString.length, count); i++) {
    const charCode = inputString.charCodeAt(i) - 64; // Assuming uppercase letters only
    result.push(Math.abs(charCode));
  }

  return result.toString().replace(/,/g, "");
}

type DateAndTime = {
  date: string;
  time: string;
};

export const getDateAndTime = (datetime: number = Date.now()): DateAndTime => {
  const date = new Date(datetime);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}:${seconds}`,
  };
};

export const paginate = (count: number, pageLimit = 10, currentPage = 1) => {
  let limit = pageLimit || 10;
  limit = Math.abs(limit);
  let page = currentPage || 1;
  page = Math.abs(page);
  const pages = Math.ceil(count / limit);
  return {
    totalItems: count,
    itemsPerPage: limit,
    currentPage: page,
    totalPages: pages,
  };
};

export function generateFilter(
  queryParams: QueryParams,
  validKeys: string[]
): QueryParams {
  let filter: QueryParams = {};

  if (!queryParams) {
    return filter;
  }

  Object.keys(queryParams).forEach((key) => {
    if (validKeys.includes(key) && queryParams[key]) {
      filter[key] = queryParams[key];
    }
  });

  return filter;
}
