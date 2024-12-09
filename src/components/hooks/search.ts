import { useState } from "react";
import { useDebounce } from "./debounce";

export const useSearch = () => {
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 500);

  return {
    debouncedSearch,
    setSearch,
    search,
  };
};
