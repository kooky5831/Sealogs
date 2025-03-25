import Image from 'next/image'

function Loading({ message = 'Loading ...', errorMessage = '' }) {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center">
            <div>
                <Image
                    src="/sealogs-loading.gif"
                    alt="Sealogs Logo"
                    priority={true}
                    width={300}
                    height={300}
                    unoptimized
                />
            </div>
            {errorMessage ? (
                <div className="text-slred-800 text-xl">{errorMessage}</div>
            ) : (
                <div>{message}</div>
            )}
        </div>
    )
}

export default Loading
