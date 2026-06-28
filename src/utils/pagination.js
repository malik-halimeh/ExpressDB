/**
 * Helper to extract, sanitize, and compute pagination configurations
 * @param {Object} query - Express request query object
 * @returns {Object} - Object containing page, limit, and skip values
 */
export const getPagination = (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;

  const sanitizedPage = page > 0 ? page : 1;
  const sanitizedLimit = limit > 0 ? limit : 10;
  const skip = (sanitizedPage - 1) * sanitizedLimit;

  return {
    page: sanitizedPage,
    limit: sanitizedLimit,
    skip
  };
};

/**
 * Helper to compute total pages for collection pagination responses
 * @param {number} totalDocuments - Total documents matching query
 * @param {number} limit - Items count per page
 * @returns {number} - Total pages count
 */
export const getPageCount = (totalDocuments, limit) => {
  return Math.ceil(totalDocuments / limit) || 1;
};
