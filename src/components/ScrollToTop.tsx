import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      const scrollToEl = (attempts = 0) => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        } else if (attempts < 10) {
          setTimeout(() => scrollToEl(attempts + 1), 100);
        }
      };
      scrollToEl();
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
};
