/**
 * Formats any date input into DD-MM-YYYY format (e.g. 03-09-2026)
 * @param {string | Date | number} dateInput
 * @returns {string} Formatted date in DD-MM-YYYY format
 */
export const formatDateDDMMYYYY = (dateInput) => {
  if (!dateInput) return 'N/A';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'N/A';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

