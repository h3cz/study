export function isBankImportEnabled(): boolean {
  return (
    process.env.NEXT_PUBLIC_ENABLE_BANK_IMPORT === "true" ||
    process.env.NODE_ENV === "development"
  );
}
