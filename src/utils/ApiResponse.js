export class ApiResponse {
  /**
   * Send a successful single resource or standard JSON response
   */
  static success(res, message, data = {}, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  /**
   * Send a paginated collection JSON response
   */
  static collection(res, message, page, limit, totalDocuments, totalPages, data, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      page,
      limit,
      totalDocuments,
      totalPages,
      data
    });
  }

  /**
   * Send a deletion confirmation response without additional fields
   */
  static delete(res, message, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message
    });
  }
}
