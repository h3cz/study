import { LOCAL_PERF_QUESTIONS } from "./local-bank";

export const newCertPbqs = LOCAL_PERF_QUESTIONS.filter(
  (question) => question.certId !== "secplus-sy0-701"
);
