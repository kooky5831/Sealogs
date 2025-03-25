import Image from 'next/image'
function LoginLogo() {
    return (
        <div>
            <Image
                src="/sealogs-horizontal-logo.png"
                alt="Sealogs Logo"
                width={300}
                height={92}
                className="dark:hidden"
            />
            <Image
                src="/sealogs-horizontal-logo-white.png"
                alt="Sealogs Logo"
                width={300}
                height={92}
                className="hidden dark:block"
            />
        </div>
    )
}

export default LoginLogo
