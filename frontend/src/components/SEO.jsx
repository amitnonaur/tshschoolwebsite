import { useEffect } from "react";

const SEO = ({ title, description }) => {
  useEffect(() => {
    document.title = title;
    let meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", description);
  }, [title, description]);
  return null;
};

export default SEO;
