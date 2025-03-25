const Skeleton = () => {
    return (
        <div role="status" className="max-w-sm animate-pulse w-full">
            <div className="h-2.5 bg-slblue-50 rounded-full dark:bg-slblue-700 my-4"></div>
            <span className="sr-only">Loading...</span>
        </div>
    )
}

export default Skeleton
