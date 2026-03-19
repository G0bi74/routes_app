import { useContext } from "react";
import { OcrContext } from "../context/OcrContext";

export const useOcr = () => {
  const context = useContext(OcrContext);

  if (!context) {
    throw new Error("useOcr musi być użyty wewnątrz OcrProvider");
  }

  return context;
};
