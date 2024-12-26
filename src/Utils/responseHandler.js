// Standardized response handler for successful responses
export const handleResponse = (res, statusCode, message, data = null) => {
    const response = {
        status: 'success',
        message: message
    };

    if (data !== null) {
        response.data = data;
    }

    return res.status(statusCode).json(response);
};

// Standardized error response handler
export const handleError = (res, statusCode, message) => {
    return res.status(statusCode).json({
        status: 'error',
        message: message
    });
};
