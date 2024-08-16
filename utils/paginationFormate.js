const { handleException } = require("../helper/exception");

const paginationResponse = async (req, res, offset, limit, data) => {
    try {
        if (!data.paginatedResult || data.paginatedResult.length === 0) {
            return {
                pagination: {
                    current_page: parseInt(offset),
                    limit: parseInt(limit),
                    total: 0,
                    next_page_url: null,
                    pre_page_url: null,
                    total_page: 0
                },
                response: []
            };
        }

        const totalPage = Math.ceil(data.totalCount[0].count / limit);
        const currentUrl = `${req.baseUrl}${req.path}`;
        const nextPageUrl = parseInt(offset) < totalPage ? `${currentUrl}?page=${parseInt(offset) + 1}&limit=${limit}` : null;
        const prePageUrl = parseInt(offset) > 1 ? `${currentUrl}?page=${parseInt(offset) - 1}&limit=${limit}` : null;

        return {
            pagination: {
                current_page: parseInt(offset),
                limit: parseInt(limit),
                total: data.totalCount[0].count,
                next_page_url: nextPageUrl,
                pre_page_url: prePageUrl,
                total_page: totalPage
            },
            response: data.paginatedResult
        };
    } catch (error) {
        console.error("Error:", error);
        return handleException(logger, res, error);
    }
};

module.exports = {
    paginationResponse
};