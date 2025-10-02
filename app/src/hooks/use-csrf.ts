import { useState, useEffect } from "react";
import { CSRFTokenAPI } from "@/api/auth";

export default function useCsrf() {
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const token = await CSRFTokenAPI();
        if (token) {
          setCsrfToken(token);
          localStorage.setItem('_csrfToken', token);
        }
      } catch (error) {
        console.error("Error fetching CSRF token:", error);
      }
    };
    fetchCsrfToken();
  }, []);

  return csrfToken;
}
