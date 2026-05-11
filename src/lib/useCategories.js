// hooks/useCategories.ts
import { useEffect, useState } from "react";
import apiRequest from "../lib/apiRequest";

export function useCategories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    apiRequest.get("/categories").then((res) => {
      setCategories(res.data);
    });
  }, []);

  return categories;
}
