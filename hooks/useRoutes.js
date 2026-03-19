import { useContext } from "react";
import { RoutesContext } from "../context/RoutesContext";

export function useRoutes() {
  const context = useContext(RoutesContext);

  if (!context) {
    throw new Error("useRoutes musi być użyty wewnątrz RoutesProvider");
  }

  return context;
}
