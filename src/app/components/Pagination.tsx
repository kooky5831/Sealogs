'use client'

interface CustomPaginationProps {
    page: number
    limit: number
    onClick: (page: number) => void
    totalCount: number
    hasNextPage: boolean
    hasPreviousPage: boolean
    visiblePageCount: number
}
const CustomPagination: React.FC<CustomPaginationProps> = ({
    page = 0,
    limit = 0,
    onClick,
    totalCount = 0,
    hasNextPage = false,
    hasPreviousPage = false,
    visiblePageCount = 0,
}) => {
    const classes = {
        paginationActive:
            'flex items-center justify-center px-4 h-10 text-blue-600 border border-gray-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white',
        paginationInactive:
            'flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white',
        paginationButtons:
            'flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white',
    }
    const maxPages = limit > 0 ? Math.ceil(totalCount / limit) : 0
    const visiblePages = limit > 0 ? visiblePageCount : 0
    // Get the left pages
    let leftPageStart = page - visiblePages
    let leftPageEnd = page
    if (leftPageStart < 0) {
        leftPageStart = 0
        leftPageEnd = visiblePages - 1
    }
    // Get the right pages
    let rightPageStart = maxPages - visiblePages
    let rightPageEnd = limit > 0 ? Math.floor(totalCount / limit) : 0
    let showEllipsis = leftPageEnd + 1 !== rightPageStart
    if (leftPageEnd >= rightPageStart) {
        leftPageStart = 0
        leftPageEnd = visiblePages - 1
    }
    if (maxPages < visiblePages) {
        leftPageStart = 0
        leftPageEnd = maxPages - 1
    }
    const leftPages = Array.from(
        { length: leftPageEnd - leftPageStart + 1 },
        (_, i) => leftPageStart + i,
    ).slice(-visiblePages)
    let rightPages = Array.from(
        { length: rightPageEnd - rightPageStart + 1 },
        (_, i) => rightPageStart + i,
    ).slice(0, visiblePages)
    rightPages = rightPages.filter((page) => !leftPages.includes(page))
    rightPages = rightPages.filter((num) => num >= 0)
    // Check if the last element of leftPages and the first element of rightPages are consecutive
    let areConsecutive =
        leftPages[leftPages.length - 1] + 1 === rightPages[0] ||
        leftPages[leftPages.length - 1] - 1 === rightPages[0]
    if (areConsecutive || rightPages.length <= 0) {
        showEllipsis = false
    }
    return (
        <div className="flex items-center justify-end p-4">
            <nav aria-label="Log Entries pagination">
                <ul className="inline-flex -space-x-px text-base h-10">
                    <li>
                        {hasPreviousPage && page > 0 && (
                            <button
                                onClick={() => onClick(0)}
                                className={`${classes.paginationButtons} rounded-s-lg`}>
                                First
                            </button>
                        )}
                    </li>
                    <li>
                        {hasPreviousPage && (
                            <button
                                onClick={() => onClick(page - 1)}
                                className={`${classes.paginationButtons}`}>
                                Previous
                            </button>
                        )}
                    </li>
                    {Array.from({ length: leftPages.length }, (_, index) => (
                        <li key={index}>
                            <button
                                onClick={() => onClick(leftPages[index])}
                                className={`${page === leftPages[index] ? classes.paginationActive : classes.paginationInactive}`}>
                                {leftPages[index] + 1}
                            </button>
                        </li>
                    ))}
                    {showEllipsis && (
                        <li>
                            <button
                                onClick={() => onClick(leftPageEnd + 1)}
                                className={`${classes.paginationInactive}`}>
                                ...
                            </button>
                        </li>
                    )}
                    {Array.from({ length: rightPages.length }, (_, index) => (
                        <li key={index}>
                            <button
                                onClick={() => onClick(rightPages[index])}
                                className={`${page === rightPages[index] ? classes.paginationActive : classes.paginationInactive}`}>
                                {rightPages[index] + 1}
                            </button>
                        </li>
                    ))}
                    <li>
                        {hasNextPage && (
                            <button
                                onClick={() => onClick(page + 1)}
                                className={`${classes.paginationButtons}`}>
                                Next
                            </button>
                        )}
                    </li>
                    <li>
                        {hasNextPage && page * limit < totalCount && (
                            <button
                                onClick={() => onClick(maxPages - 1)}
                                className={`${classes.paginationButtons} rounded-e-lg`}>
                                Last
                            </button>
                        )}
                    </li>
                </ul>
            </nav>
        </div>
    )
}

export default CustomPagination
