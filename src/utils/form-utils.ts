export const generateOrganisationId = (name: string): string => {
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .substring(0, 15);
  const suffix = crypto.randomUUID().substring(0, 5).toUpperCase();
  return `${cleanName}-${suffix}`;
};
