import SealogsLogo from './sealogs-logo'
import { ThemeSwitcher } from '../components/ThemeSwitcher'

export default function RightSidebar(props: any) {
    return (
        <>
            <aside
                className={`fixed top-0 right-0 z-40 w-64 h-screen p-4 overflow-y-auto transition-transform bg-white dark:bg-gray-800 translate-x-full`}>
                <div className="h-screen sticky top-0">
                    <div className={`mb-4 flex justify-end pt-4`}>
                        {/* <ThemeSwitcher /> */}
                    </div>
                    <div className="my-4"></div>
                </div>
            </aside>
        </>
    )
}
