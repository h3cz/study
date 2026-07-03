import { LOCAL_ACRONYMS } from "./local-bank";

export const ACRONYMS = LOCAL_ACRONYMS.filter(
  (acronym) => acronym.certId === "secplus-sy0-701"
);
