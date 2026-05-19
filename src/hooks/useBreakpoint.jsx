import { useState, useEffect } from "react";

export default function useBreakpoint() {
  const get = () => {
    if (typeof window === "undefined") return "desktop";
    if (window.innerWidth < 480) return "mobile";
    if (window.innerWidth < 768) return "mobileLg";
    if (window.innerWidth < 1024) return "tablet";
    return "desktop";
  };

  const [bp, setBp] = useState(get);

  useEffect(() => {
    const fn = () => setBp(get());
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  return bp;
}
