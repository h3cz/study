import { LOCAL_ACRONYMS } from "./local-bank";

export const newCertAcronyms = LOCAL_ACRONYMS.filter(
  (acronym) => acronym.certId !== "secplus-sy0-701"
);
