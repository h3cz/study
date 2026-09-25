import { LOCAL_ACRONYMS } from "./local-bank";
import { AZ104_ACRONYMS } from "./az-104-bank";

export const newCertAcronyms = [
  ...LOCAL_ACRONYMS.filter((acronym) => acronym.certId !== "secplus-sy0-701"),
  ...AZ104_ACRONYMS,
];
