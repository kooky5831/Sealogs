import { Button, Dialog, DialogTrigger, Popover } from 'react-aria-components'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { SealogsMaintenanceIcon } from '../lib/icons/SealogsMaintenanceIcon'
import { SealogsReportsIcon } from '../lib/icons/SealogsReportsIcon'
import { usePathname } from 'next/navigation'

export default function Navigation(props: any) {
    const pathname = usePathname()
    const [toggleSettings, setToggleSettings] = useState(
        pathname.includes('/settings/crew-duty/list') ||
            pathname.includes('/settings/inventory/category')
            ? true
            : false,
    )
    const [toggleCrew, setToggleCrew] = useState(
        (pathname.includes('/crew') ||
            pathname.includes('/crew-training') ||
            pathname.includes('/training-type')) &&
            !pathname.includes('/settings')
            ? true
            : false,
    )
    const [toggleHnS, setToggleHnS] = useState(
        (pathname.includes('/health-and-safety') ||
            pathname.includes('/risk-evaluations') ||
            pathname.includes('/risk-strategies')) &&
            !pathname.includes('/settings')
            ? true
            : false,
    )
    const [toggleVessel, setToggleVessel] = useState(
        pathname.includes('/vessel') || pathname.includes('/info')
            ? true
            : false,
    )
    const [toggleInventory, setToggleInventory] = useState(
        (pathname.includes('/inventory') ||
            pathname.includes('/inventory/suppliers')) &&
            !pathname.includes('/settings')
            ? true
            : false,
    )
    const classes = {
        button: 'peer flex  p-1.5 xl:pl-2 focus-visible:outline-none items-center justify-center md:justify-start',
        icons: 'inline-block',
        navigation:
            'hidden xl:inline-block hover:text-sldarkblue-1000 dark:hover:text-slblue-200',
        active: 'bg-sllightblue-50 dark:bg-sldarkblue-950 dark:text-white rounded-md text-sldarkblue-1000 my-2',
        link: 'hover:bg-sllightblue-50 dark:hover:bg-sldarkblue-950 dark:text-white rounded-md font-light my-2',
        innerMenu:
            'border-l border-gray-200 border-solid lg:ml-4 w-full dark:border-white',
        innerItem:
            'font-light py-2 pl-2 border-l hover:border-sky-600 relative -left-[1px]',
    }
    const [superAdmin, setSuperAdmin] = useState(false)
    const [admin, setAdmin] = useState(false)
    useEffect(() => {
        const superAdmin = localStorage.getItem('superAdmin') === 'true'
        const admin = localStorage.getItem('admin') === 'true'
        setSuperAdmin(superAdmin)
        setAdmin(admin)
    }, [])

    return (
        <>
            <ul className="w-full">
                <li
                    className={`${pathname.includes('/dashboard') ? classes.active : classes.link}`}>
                    <Link href={`/dashboard`}>
                        <div className={classes.button}>
                            <svg
                                className="m-auto lg:-ml-1 lg:mr-2 h-6 w-6"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 18.25 18.9694">
                                <path
                                    d="M3.7644,6.4216v1.8518H.9085c-.046,0-.0834.0295-.0834.0659v1.3968c0,.0364.0375.0659.0834.0659h2.8383l-1.798,7.3455H.2084c-.046,0-.0834.0295-.0834.0659v1.565c0,.0364.0375.0659.0834.0659h13.0251c.046,0,.0834-.0295.0834-.0659v-1.565c0-.0364-.0375-.0659-.0834-.0659h-1.7404l-1.798-7.3455h2.8383c.046,0,.0834-.0295.0834-.0659v-1.3968c0-.0364-.0375-.0659-.0834-.0659h-2.8559v-1.8518"
                                    fill="#f4f5f7"
                                    stroke="#022450"
                                    strokeMiterlimit="10"
                                    strokeWidth=".25px"
                                />
                                <path
                                    d="M11.3234,17.1477h-2.6167v-2.2134c0-.8653-.8907-1.5694-1.9857-1.5694s-1.9857.7041-1.9857,1.5694v2.2134h-2.6167l1.798-7.3455h5.6089l1.798,7.3455h-.0001Z"
                                    fill="#022450"
                                    stroke="#022450"
                                    strokeMiterlimit="10"
                                    strokeWidth=".25px"
                                />
                                <path
                                    d="M9.6802,6.4344l-.0026-2.2096h1.8977c.0336,0,.0639-.0158.0769-.0402s.0062-.0525-.0169-.0716L6.7809.1444c-.0313-.0258-.0886-.0258-.1199,0L1.8067,4.1129c-.0231.0191-.03.0473-.0169.0716s.0433.0402.0769.0402h1.8977l-.0006,2.1949M4.9021,17.1477v-2.2134c0-.7927.8161-1.4375,1.8189-1.4375s1.8189.6448,1.8189,1.4375v2.2134h-3.6378ZM11.3234,17.1477h-2.6167v-2.2134c0-.8653-.8907-1.5694-1.9857-1.5694s-1.9857.7041-1.9857,1.5694v2.2134h-2.6167l1.798-7.3455h5.6089l1.798,7.3455h-.0001ZM2.0635,4.0929L6.721.2852l4.6575,3.8077H2.0635ZM12.45,8.4053v1.2649H.9919v-1.2649s11.4581,0,11.4581,0Z"
                                    fill="#ffffff"
                                    stroke="#022450"
                                    strokeMiterlimit="10"
                                    strokeWidth=".25px"
                                />
                                <polygon
                                    points="18.125 4.673 18.125 8.0041 9.9631 6.3386 18.125 4.673"
                                    fill="#f4f5f7"
                                    stroke="#022450"
                                    strokeMiterlimit="10"
                                    strokeWidth=".25px"
                                />
                                <rect
                                    x="3.9312"
                                    y="4.2247"
                                    width="5.5795"
                                    height="4.0487"
                                    fill="#ffffff"
                                    stroke="#022450"
                                    strokeMiterlimit="10"
                                    strokeWidth=".25px"
                                />
                            </svg>
                            <span className={classes.navigation}>
                                Home port
                            </span>
                        </div>
                    </Link>
                </li>
                <li
                    className={`${pathname.includes('/vessel') ? classes.active : classes.link}`}>
                    <Link href={`/vessel`}>
                        <div className={classes.button}>
                            <svg
                                className="m-auto lg:-ml-1 lg:mr-2 h-6 w-6"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 18.2516 18.25">
                                <path
                                    d="M.4555,10.1766l1.1353-.2518.9378,4.8349c-.5688.2635-.899.4271-.9163.4357-.0278.0139-.0419.0489-.0325.0811l.8144,2.8024c.0082.0276.0311.0462.0571.0462h11.9791c.0225,0,.0433-.014.0534-.0364l3.6364-7.9471c.0098-.0212.0084-.0467-.0033-.0666-.0117-.02-.033-.0326-.0536-.03-1.2718.0808-2.6261.3034-3.9904.6128L12.388.4309c-.004-.0235-.019-.043-.0393-.0508l-.6471-.2513c-.0183-.0074-.0393-.0035-.055.0091l-.3711.3025c-.1613-.0072-1.1249-.0149-1.8995.7893-.7908.8212-2.5893.667-2.6073.6654-.0194-.0025-.0393.0074-.0517.0247-.0124.0172-.0164.0402-.0105.0612l.755,2.7082c.0056.0202.0194.036.0372.043.2485.0983.499.1391.7437.1391.9024-.0001,1.7276-.5554,2.0936-.8424.6172-.4841,1.2696-.2974,1.4153-.2464l1.1343,7.1644c-1.1124.2898-2.2174.6271-3.2765.9827l-1.21-5.5463c-.0037-.0174-.0138-.0324-.0276-.0415s-.03-.0114-.0461-.0072L.1695,8.7569c-.0311.0092-.0501.0441-.0431.0788l.2588,1.29c.0073.0352.0374.0589.0702.0508ZM10.2668,3.9203c-.4458.3496-1.5959,1.1135-2.6998.6974l-.7201-2.5837c.3812.0217,1.8753.0567,2.6111-.7072.6954-.7221,1.5762-.7569,1.7852-.754l.4849,3.0629c-.2352-.0714-.8557-.1902-1.4613.2846ZM11.3592.5373l.3328-.2713.5844.227,1.6789,10.1913c-.3175.0731-.6353.151-.9527.2327L11.3592.5373ZM17.9659,10.1846l-3.5722,7.8072H2.4949l-.7845-2.6993c.7402-.3631,9.5992-4.6463,16.2555-5.108ZM9.4942,11.9682c-1.4555.492-2.8199,1.0163-3.9915,1.4964l-1.0176-4.5534,4.0762-1.2196.9329,4.2766ZM8.2972,6.4811l.2358,1.0811-4.136,1.2375c-.0314.0094-.0503.0451-.0424.0802l1.0351,4.6311c-1.1385.4686-2.0868.8916-2.7488,1.1967l-.9456-4.8752c-.007-.0355-.0367-.0584-.0702-.0512l-1.1357.252-.2336-1.1642,8.0413-2.388Z"
                                    fill="#022450"
                                    stroke="#022450"
                                    strokeMiterlimit="10"
                                    strokeWidth=".25px"
                                />
                                <path
                                    d="M10.2668,3.9203c-.4458.3496-1.5959,1.1135-2.6998.6974l-.7201-2.5837c.3812.0217,1.8753.0567,2.6111-.7072.6954-.7221,1.5762-.7569,1.7852-.754l.4849,3.0629c-.2352-.0714-.8557-.1902-1.4613.2846Z"
                                    fill="#2a99ea"
                                    stroke="#022450"
                                    strokeMiterlimit="10"
                                    strokeWidth=".25px"
                                />
                                <path
                                    d="M17.9659,10.1846l-3.5722,7.8072H2.4949l-.7845-2.6993c.7402-.3631,9.5992-4.6463,16.2555-5.108Z"
                                    fill="#f2f4f7"
                                    stroke="#022450"
                                    strokeMiterlimit="10"
                                    strokeWidth=".25px"
                                />
                            </svg>
                            <span className={classes.navigation}>
                                All vessels
                            </span>
                        </div>
                    </Link>
                </li>
                <li
                    className={`${(pathname.includes('/crew') || pathname.includes('/crew-training')) && !pathname.includes('/settings') ? classes.active : classes.link} hidden xl:block`}>
                    <Button
                        className={classes.button}
                        onPress={() => setToggleCrew(!toggleCrew)}>
                        <svg
                            className="m-auto lg:-ml-1 lg:mr-2 h-6 w-6"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 19 18.25">
                            <path
                                d="M18.6935,7.7297h-2.3172c-.9285-2.994-3.7221-5.0658-6.8763-5.0658S3.5522,4.7357,2.6237,7.7297H.3065c-.0901,0-.1757.0396-.2341.1087s-.0832.16-.068.249l1.2258,7.2433c.0249.1473.1526.2554.3022.2554h15.9354c.1493,0,.277-.1079.3022-.2554l1.2258-7.2433c.0151-.0891-.0098-.18-.068-.249s-.144-.1087-.2341-.1087ZM.6175,8.3096h17.7656l-.356,1.8273H.9729l-.3554-1.8273ZM9.5,3.2768c2.8218,0,5.329,1.8115,6.233,4.4529H3.267c.904-2.6414,3.4112-4.4529,6.233-4.4529ZM17.2087,14.973H1.7914l-.7146-4.2233h16.8466l-.7146,4.2233Z"
                                fill="#022450"
                                stroke="#022450"
                                strokeMiterlimit="10"
                                strokeWidth="0px"
                            />
                            <polygon
                                points=".6175 8.3096 18.3831 8.3096 18.0271 10.1368 .9729 10.1368 .6175 8.3096"
                                fill="#f2f4f7"
                                stroke="#022450"
                                strokeMiterlimit="10"
                                strokeWidth="0px"
                            />
                        </svg>
                        <span className={classes.navigation}>Crew</span>
                    </Button>
                    <div
                        className={`peer w-full flex dark:bg-sldarkblue-900 dark:text-white justify-between p-2 ${toggleCrew ? 'block' : 'hidden'}`}>
                        <ul className={classes.innerMenu}>
                            <li
                                className={`${classes.innerItem} ${pathname.includes('/crew') && !pathname.includes('/crew-training') ? 'border-slblue-500' : 'border-transparent'}`}>
                                <Link href="/crew">
                                    <span className={classes.navigation}>
                                        All crew
                                    </span>
                                </Link>
                            </li>
                            <li
                                className={`${classes.innerItem} ${pathname.includes('/crew-training') || pathname.includes('/training-type') ? 'border-slblue-500' : 'border-transparent'}`}>
                                <Link href="/crew-training">
                                    <span className={classes.navigation}>
                                        Training / Drills
                                    </span>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </li>
                <li className="sm:block xl:hidden">
                    <DialogTrigger>
                        <Button className={classes.button}>
                            <svg
                                className="m-auto lg:-ml-1 lg:mr-2 h-6 w-6"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 19 18.25">
                                <path
                                    d="M18.6935,7.7297h-2.3172c-.9285-2.994-3.7221-5.0658-6.8763-5.0658S3.5522,4.7357,2.6237,7.7297H.3065c-.0901,0-.1757.0396-.2341.1087s-.0832.16-.068.249l1.2258,7.2433c.0249.1473.1526.2554.3022.2554h15.9354c.1493,0,.277-.1079.3022-.2554l1.2258-7.2433c.0151-.0891-.0098-.18-.068-.249s-.144-.1087-.2341-.1087ZM.6175,8.3096h17.7656l-.356,1.8273H.9729l-.3554-1.8273ZM9.5,3.2768c2.8218,0,5.329,1.8115,6.233,4.4529H3.267c.904-2.6414,3.4112-4.4529,6.233-4.4529ZM17.2087,14.973H1.7914l-.7146-4.2233h16.8466l-.7146,4.2233Z"
                                    fill="#022450"
                                    stroke="#022450"
                                    strokeMiterlimit="10"
                                    strokeWidth="0px"
                                />
                                <polygon
                                    points=".6175 8.3096 18.3831 8.3096 18.0271 10.1368 .9729 10.1368 .6175 8.3096"
                                    fill="#f2f4f7"
                                    stroke="#022450"
                                    strokeMiterlimit="10"
                                    strokeWidth="0px"
                                />
                            </svg>
                        </Button>
                        <Popover
                            placement="right"
                            className="bg-sldarkblue-900 text-white rounded">
                            <Dialog>
                                <div
                                    className={`peer w-full flex dark:bg-sldarkblue-900 dark:text-white justify-between p-2`}>
                                    <ul className={classes.innerMenu}>
                                        <li
                                            className={`${classes.innerItem} ${pathname.includes('/crew') && !pathname.includes('/crew-training') ? 'border-slblue-500' : 'border-transparent'}`}>
                                            <Link href="/crew">
                                                <span>All crew</span>
                                            </Link>
                                        </li>
                                        <li
                                            className={`${classes.innerItem} ${pathname.includes('/crew-training') || pathname.includes('/training-type') ? 'border-slblue-500' : 'border-transparent'}`}>
                                            <Link href="/crew-training">
                                                <span>Training / Drills</span>
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            </Dialog>
                        </Popover>
                    </DialogTrigger>
                </li>
                <li
                    className={`${(pathname.includes('/risk-evaluations') || pathname.includes('/risk-strategies')) && !pathname.includes('/settings') ? classes.active : classes.link} hidden xl:block`}>
                    <Button
                        className={classes.button}
                        onPress={() => setToggleHnS(!toggleHnS)}>
                        <svg
                            className="m-auto lg:-ml-1 lg:mr-2 h-6 w-6"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 19.209 18.25">
                            <rect
                                x=".2658"
                                y="5.9435"
                                width="18.6775"
                                height="12.0407"
                                rx=".6387"
                                ry=".6387"
                                fill="#f2f4f7"
                                stroke="#022450"
                                strokeMiterlimit="10"
                                strokeWidth="0.25px"
                            />
                            <path
                                d="M19.084,17.3455V3.2669c0-.4297-.3497-.7795-.7795-.7795h-9.5224L7.0224.1531c-.0132-.0177-.0341-.028-.0561-.028H.9045C.4747.125.125.4748.125.9045v16.441c0,.4297.3497.7795.7795.7795h17.4001c.4297,0,.7795-.3497.7795-.7795ZM3.2614,5.8028H.9045c-.2644,0-.4977.133-.6387.3349V.9045C.2658.5523.5523.2658.9045.2658h6.0267l1.7597,2.3343c.0132.0177.0341.028.0561.028h9.5576c.3522,0,.6387.2865.6387.6387v2.8707c-.141-.2019-.3743-.3349-.6387-.3349h-2.3569M15.8069,5.8028H3.4022M.2658,17.3455V6.5821c0-.3521.2865-.6386.6387-.6386h17.4001c.3522,0,.6387.2865.6387.6386v10.7634c0,.3522-.2865.6387-.6387.6387H.9045c-.3522,0-.6387-.2865-.6387-.6387Z"
                                fill="#022450"
                                stroke="#022450"
                                strokeMiterlimit="10"
                                strokeWidth="0.25px"
                            />
                            <path
                                d="M13.3511,13.1097h-2.6351c-.0698,0-.1268.0567-.1268.1268v2.6351h-1.9696v-2.6351c0-.0701-.0569-.1268-.1268-.1268h-2.6351v-1.9694h2.6351c.0698,0,.1268-.0567.1268-.1268v-2.6351h1.9696v2.6351c0,.0701.0569.1268.1268.1268h2.6351v1.9694Z"
                                fill="#ffffff"
                                stroke="#022450"
                                strokeMiterlimit="10"
                                strokeWidth="0.3885px"
                            />
                            <path
                                d="M13.4779,10.8868h-2.6351v-2.6351c0-.0701-.0569-.1268-.1268-.1268h-2.2231c-.0698,0-.1268.0567-.1268.1268v2.6351h-2.6351c-.0698,0-.1268.0567-.1268.1268v2.2229c0,.0701.0569.1268.1268.1268h2.6351v2.6351c0,.0701.0569.1268.1268.1268h2.2231c.0698,0,.1268-.0567.1268-.1268v-2.6351h2.6351c.0698,0,.1268-.0567.1268-.1268v-2.2229c0-.0701-.0569-.1268-.1268-.1268ZM13.3511,13.1097h-2.6351c-.0698,0-.1268.0567-.1268.1268v2.6351h-1.9696v-2.6351c0-.0701-.0569-.1268-.1268-.1268h-2.6351v-1.9694h2.6351c.0698,0,.1268-.0567.1268-.1268v-2.6351h1.9696v2.6351c0,.0701.0569.1268.1268.1268h2.6351v1.9694Z"
                                fill="#022450"
                                stroke="#022450"
                                strokeMiterlimit="10"
                                strokeWidth="0.3885px"
                            />
                        </svg>
                        <span className={classes.navigation}>
                            Health & safety
                        </span>
                    </Button>
                    <div
                        className={`peer w-full flex dark:bg-sldarkblue-900 dark:text-white justify-between p-2 ${toggleHnS ? 'block' : 'hidden'}`}>
                        <ul className={classes.innerMenu}>
                            <li
                                className={`${classes.innerItem} ${pathname.includes('/risk-evaluations') ? 'border-slblue-500' : 'border-transparent'}`}>
                                <Link href="/risk-evaluations">
                                    <span className={classes.navigation}>
                                        Risk Evaluations
                                    </span>
                                </Link>
                            </li>
                            <li
                                className={`${classes.innerItem} ${pathname.includes('/risk-strategies') ? 'border-slblue-500' : 'border-transparent'}`}>
                                <Link href="/risk-strategies">
                                    <span className={classes.navigation}>
                                        Risk Strategies
                                    </span>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </li>
                <li className="sm:block xl:hidden">
                    <DialogTrigger>
                        <Button className={classes.button}>
                            <svg
                                className="m-auto lg:-ml-1 lg:mr-2 h-6 w-6"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 19.209 18.25">
                                <rect
                                    x=".2658"
                                    y="5.9435"
                                    width="18.6775"
                                    height="12.0407"
                                    rx=".6387"
                                    ry=".6387"
                                    fill="#f2f4f7"
                                    stroke="#022450"
                                    strokeMiterlimit="10"
                                    strokeWidth="0.25px"
                                />
                                <path
                                    d="M19.084,17.3455V3.2669c0-.4297-.3497-.7795-.7795-.7795h-9.5224L7.0224.1531c-.0132-.0177-.0341-.028-.0561-.028H.9045C.4747.125.125.4748.125.9045v16.441c0,.4297.3497.7795.7795.7795h17.4001c.4297,0,.7795-.3497.7795-.7795ZM3.2614,5.8028H.9045c-.2644,0-.4977.133-.6387.3349V.9045C.2658.5523.5523.2658.9045.2658h6.0267l1.7597,2.3343c.0132.0177.0341.028.0561.028h9.5576c.3522,0,.6387.2865.6387.6387v2.8707c-.141-.2019-.3743-.3349-.6387-.3349h-2.3569M15.8069,5.8028H3.4022M.2658,17.3455V6.5821c0-.3521.2865-.6386.6387-.6386h17.4001c.3522,0,.6387.2865.6387.6386v10.7634c0,.3522-.2865.6387-.6387.6387H.9045c-.3522,0-.6387-.2865-.6387-.6387Z"
                                    fill="#022450"
                                    stroke="#022450"
                                    strokeMiterlimit="10"
                                    strokeWidth="0.25px"
                                />
                                <path
                                    d="M13.3511,13.1097h-2.6351c-.0698,0-.1268.0567-.1268.1268v2.6351h-1.9696v-2.6351c0-.0701-.0569-.1268-.1268-.1268h-2.6351v-1.9694h2.6351c.0698,0,.1268-.0567.1268-.1268v-2.6351h1.9696v2.6351c0,.0701.0569.1268.1268.1268h2.6351v1.9694Z"
                                    fill="#ffffff"
                                    stroke="#022450"
                                    strokeMiterlimit="10"
                                    strokeWidth="0.3885px"
                                />
                                <path
                                    d="M13.4779,10.8868h-2.6351v-2.6351c0-.0701-.0569-.1268-.1268-.1268h-2.2231c-.0698,0-.1268.0567-.1268.1268v2.6351h-2.6351c-.0698,0-.1268.0567-.1268.1268v2.2229c0,.0701.0569.1268.1268.1268h2.6351v2.6351c0,.0701.0569.1268.1268.1268h2.2231c.0698,0,.1268-.0567.1268-.1268v-2.6351h2.6351c.0698,0,.1268-.0567.1268-.1268v-2.2229c0-.0701-.0569-.1268-.1268-.1268ZM13.3511,13.1097h-2.6351c-.0698,0-.1268.0567-.1268.1268v2.6351h-1.9696v-2.6351c0-.0701-.0569-.1268-.1268-.1268h-2.6351v-1.9694h2.6351c.0698,0,.1268-.0567.1268-.1268v-2.6351h1.9696v2.6351c0,.0701.0569.1268.1268.1268h2.6351v1.9694Z"
                                    fill="#022450"
                                    stroke="#022450"
                                    strokeMiterlimit="10"
                                    strokeWidth="0.3885px"
                                />
                            </svg>
                        </Button>
                        <Popover
                            placement="right"
                            className="bg-sldarkblue-900 text-white rounded">
                            <Dialog>
                                <div
                                    className={`peer w-full flex dark:bg-sldarkblue-900 dark:text-white justify-between p-2`}>
                                    <ul className={classes.innerMenu}>
                                        <li
                                            className={`${classes.innerItem} ${pathname.includes('/risk-evaluations') ? 'border-sky-600' : 'border-transparent'}`}>
                                            <Link href="/risk-evaluations">
                                                <span>Risk Evaluations</span>
                                            </Link>
                                        </li>
                                        <li
                                            className={`${classes.innerItem} ${pathname.includes('/risk-strategies') ? 'border-sky-600' : 'border-transparent'}`}>
                                            <Link href="/risk-strategies">
                                                <span>Risk Strategies</span>
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            </Dialog>
                        </Popover>
                    </DialogTrigger>
                </li>
                <li
                    className={`${(pathname.includes('/inventory') || pathname.includes('/inventory/suppliers')) && !pathname.includes('/settings') ? classes.active : classes.link} hidden xl:block`}>
                    <Button
                        className={classes.button}
                        onPress={() => setToggleInventory(!toggleInventory)}>
                        <svg
                            className="m-auto lg:-ml-1 lg:mr-2 h-6 w-6"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 19.4014 20.2416">
                            <rect
                                x=".2681"
                                y="15.3634"
                                width="7.1756"
                                height="1.7875"
                                fill="#f2f4f7"
                                stroke="#022450"
                                strokeMiterlimit="10"
                                strokeWidth="0.25px"
                            />
                            <rect
                                x="11.9577"
                                y="15.3634"
                                width="7.1756"
                                height="1.7875"
                                fill="#f2f4f7"
                                stroke="#022450"
                                strokeMiterlimit="10"
                                strokeWidth="0.25px"
                            />
                            <path
                                d="M15.4984,9.1277l1.4943-7.5975c.0066-.0338-.0109-.0678-.0426-.0817L13.9446.125c-.0026-.0012-.0054-.0005-.0081-.0014-.0036-.0011-.0065-.0011-.0102-.0017-.016-.0026-.0319-.0009-.0462.007-.0009.0005-.0019-.0001-.0028.0004-.0001,0-.0021.0012-.0024.0014,0,0-.0001,0-.0002,0,0,0,0,0,0,0-.0412.0243-1.711.9955-4.1739.9955C7.24,1.1263,5.5679.155,5.5268.1308c0,0,0,0,0,0,0,0-.0001,0-.0002,0-.0003-.0002-.0023-.0013-.0024-.0014-.0009-.0006-.002,0-.0029-.0004-.0141-.0077-.0299-.0094-.0459-.0069-.0038.0006-.0069.0005-.0106.0017-.0026.0008-.0054.0002-.0079.0013l-3.0056,1.3236c-.0316.014-.0492.0479-.0426.0817l1.4943,7.5975L.1481,12.1682c-.0173.0141-.0273.0351-.0273.0573v7.8217c0,.0406.0331.0737.0737.0737h8.1825c.0196,0,.0383-.0078.0521-.0216l1.2716-1.2716,1.2716,1.2716c.0138.0138.0325.0216.0521.0216h8.1825c.0406,0,.0737-.0331.0737-.0737v-7.8217c0-.0222-.0101-.0432-.0273-.0573l-3.7548-3.0404ZM9.9007,15.1208l-.1263-7.6558c.4834-.1725,4.164-1.6693,4.2137-7.1599l2.8488,1.2545-1.4914,7.5832c-.0055.0268.0046.0544.0259.0715l3.6294,2.9065.1,3M9.7007,1.2736c2.1585,0,3.7208-.7367,4.1378-.9558-.0575,5.5134-3.8279,6.9121-4.1379,7.017-.3103-.1047-4.0803-1.4989-4.1378-7.017.417.2191,1.9793.9558,4.1378.9558ZM.3507,15.1208v-3l3.6794-2.9065c.0213-.0171.0314-.0447.0259-.0715L2.5645,1.5596,5.4134.3051c.0498,5.488,3.7275,6.9862,4.2137,7.16l.0737,7.6557h-2M.2681,15.3634h7.1756v1.7875H.2681v-1.7875ZM9.627,18.6929l-1.2806,1.2806H.2681v-2.6753h7.183c.0363.2613.2589.4638.53.4638h1.6459v.931ZM7.9811,17.6146c-.2152,0-.3901-.1749-.3901-.3901v-1.9348c0-.2152.1749-.3904.3901-.3904h1.7189s.0004.0003.0007.0003.0004-.0003.0007-.0003h1.7189c.2152,0,.3901.1752.3901.3904v1.9348c0,.2152-.1749.3901-.3901.3901h-3.4392ZM19.1333,19.9735h-8.0784l-1.2806-1.2806v-.931h1.6459c.2711,0,.4937-.2025.53-.4638h7.183v2.6753ZM19.1333,17.1509h-7.1756v-1.7875h7.1756v1.7875Z"
                                fill="#022450"
                                stroke="#022450"
                                strokeMiterlimit="10"
                                strokeWidth="0.25px"
                            />
                            <path
                                d="M7.9811,17.6146c-.2152,0-.3901-.1749-.3901-.3901v-1.9348c0-.2152.1749-.3904.3901-.3904h1.7189s.0004.0003.0007.0003.0004-.0003.0007-.0003h1.7189c.2152,0,.3901.1752.3901.3904v1.9348c0,.2152-.1749.3901-.3901.3901h-3.4392Z"
                                fill="#f2f4f7"
                                stroke="#022450"
                                strokeMiterlimit="10"
                                strokeWidth="0.25px"
                            />
                        </svg>
                        <span className={classes.navigation}>Inventory</span>
                    </Button>
                    <div
                        className={`peer w-full flex dark:bg-sldarkblue-900 dark:text-white justify-between p-2 ${toggleInventory ? 'block' : 'hidden'}`}>
                        <ul className={classes.innerMenu}>
                            <li
                                className={`${classes.innerItem} ${pathname.includes('/inventory') && !pathname.includes('/inventory/suppliers') ? 'border-sky-600' : 'border-transparent'}`}>
                                <Link href="/inventory">
                                    <span className={classes.navigation}>
                                        All inventory
                                    </span>
                                </Link>
                            </li>
                            <li
                                className={`${classes.innerItem} ${pathname.includes('/inventory/suppliers') ? 'border-sky-600' : 'border-transparent'}`}>
                                <Link href="/inventory/suppliers">
                                    <span className={classes.navigation}>
                                        Suppliers
                                    </span>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </li>
                <li className="sm:block xl:hidden">
                    <DialogTrigger>
                        <Button className={classes.button}>
                            <svg
                                className="m-auto lg:-ml-1 lg:mr-2 h-6 w-6"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 19.4014 20.2416">
                                <rect
                                    x=".2681"
                                    y="15.3634"
                                    width="7.1756"
                                    height="1.7875"
                                    fill="#f2f4f7"
                                    stroke="#022450"
                                    strokeMiterlimit="10"
                                    strokeWidth="0.25px"
                                />
                                <rect
                                    x="11.9577"
                                    y="15.3634"
                                    width="7.1756"
                                    height="1.7875"
                                    fill="#f2f4f7"
                                    stroke="#022450"
                                    strokeMiterlimit="10"
                                    strokeWidth="0.25px"
                                />
                                <path
                                    d="M15.4984,9.1277l1.4943-7.5975c.0066-.0338-.0109-.0678-.0426-.0817L13.9446.125c-.0026-.0012-.0054-.0005-.0081-.0014-.0036-.0011-.0065-.0011-.0102-.0017-.016-.0026-.0319-.0009-.0462.007-.0009.0005-.0019-.0001-.0028.0004-.0001,0-.0021.0012-.0024.0014,0,0-.0001,0-.0002,0,0,0,0,0,0,0-.0412.0243-1.711.9955-4.1739.9955C7.24,1.1263,5.5679.155,5.5268.1308c0,0,0,0,0,0,0,0-.0001,0-.0002,0-.0003-.0002-.0023-.0013-.0024-.0014-.0009-.0006-.002,0-.0029-.0004-.0141-.0077-.0299-.0094-.0459-.0069-.0038.0006-.0069.0005-.0106.0017-.0026.0008-.0054.0002-.0079.0013l-3.0056,1.3236c-.0316.014-.0492.0479-.0426.0817l1.4943,7.5975L.1481,12.1682c-.0173.0141-.0273.0351-.0273.0573v7.8217c0,.0406.0331.0737.0737.0737h8.1825c.0196,0,.0383-.0078.0521-.0216l1.2716-1.2716,1.2716,1.2716c.0138.0138.0325.0216.0521.0216h8.1825c.0406,0,.0737-.0331.0737-.0737v-7.8217c0-.0222-.0101-.0432-.0273-.0573l-3.7548-3.0404ZM9.9007,15.1208l-.1263-7.6558c.4834-.1725,4.164-1.6693,4.2137-7.1599l2.8488,1.2545-1.4914,7.5832c-.0055.0268.0046.0544.0259.0715l3.6294,2.9065.1,3M9.7007,1.2736c2.1585,0,3.7208-.7367,4.1378-.9558-.0575,5.5134-3.8279,6.9121-4.1379,7.017-.3103-.1047-4.0803-1.4989-4.1378-7.017.417.2191,1.9793.9558,4.1378.9558ZM.3507,15.1208v-3l3.6794-2.9065c.0213-.0171.0314-.0447.0259-.0715L2.5645,1.5596,5.4134.3051c.0498,5.488,3.7275,6.9862,4.2137,7.16l.0737,7.6557h-2M.2681,15.3634h7.1756v1.7875H.2681v-1.7875ZM9.627,18.6929l-1.2806,1.2806H.2681v-2.6753h7.183c.0363.2613.2589.4638.53.4638h1.6459v.931ZM7.9811,17.6146c-.2152,0-.3901-.1749-.3901-.3901v-1.9348c0-.2152.1749-.3904.3901-.3904h1.7189s.0004.0003.0007.0003.0004-.0003.0007-.0003h1.7189c.2152,0,.3901.1752.3901.3904v1.9348c0,.2152-.1749.3901-.3901.3901h-3.4392ZM19.1333,19.9735h-8.0784l-1.2806-1.2806v-.931h1.6459c.2711,0,.4937-.2025.53-.4638h7.183v2.6753ZM19.1333,17.1509h-7.1756v-1.7875h7.1756v1.7875Z"
                                    fill="#022450"
                                    stroke="#022450"
                                    strokeMiterlimit="10"
                                    strokeWidth="0.25px"
                                />
                                <path
                                    d="M7.9811,17.6146c-.2152,0-.3901-.1749-.3901-.3901v-1.9348c0-.2152.1749-.3904.3901-.3904h1.7189s.0004.0003.0007.0003.0004-.0003.0007-.0003h1.7189c.2152,0,.3901.1752.3901.3904v1.9348c0,.2152-.1749.3901-.3901.3901h-3.4392Z"
                                    fill="#f2f4f7"
                                    stroke="#022450"
                                    strokeMiterlimit="10"
                                    strokeWidth="0.25px"
                                />
                            </svg>
                        </Button>
                        <Popover
                            placement="right"
                            className="bg-sldarkblue-900 text-white rounded">
                            <Dialog>
                                <div
                                    className={`peer w-full flex dark:bg-sldarkblue-900 dark:text-white justify-between p-2`}>
                                    <ul className={classes.innerMenu}>
                                        <li
                                            className={`${classes.innerItem} ${pathname.includes('/inventory') && !pathname.includes('/inventory/suppliers') ? 'border-sky-600' : 'border-transparent'}`}>
                                            <Link href="/inventory">
                                                <span>All inventory</span>
                                            </Link>
                                        </li>
                                        <li
                                            className={`${classes.innerItem} ${pathname.includes('/inventory/suppliers') ? 'border-sky-600' : 'border-transparent'}`}>
                                            <Link href="/inventory/suppliers">
                                                <span>Suppliers</span>
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            </Dialog>
                        </Popover>
                    </DialogTrigger>
                </li>
                <li
                    className={`${pathname.includes('/maintenance') ? classes.active : classes.link}`}>
                    <Link href={`/maintenance`}>
                        <div className={classes.button}>
                            <SealogsMaintenanceIcon
                                className={`${classes.icons} m-auto lg:-ml-1 lg:mr-2 h-6 w-6`}
                            />
                            <span className={classes.navigation}>
                                Maintenance
                            </span>
                        </div>
                    </Link>
                </li>
                <li
                    className={`${pathname.includes('/document-locker') ? classes.active : classes.link}`}>
                    <Link href={`/document-locker`}>
                        <div className={classes.button}>
                            <div
                                className={`${classes.icons} m-auto lg:-ml-1 lg:mr-2 h-6 w-6`}>
                                <svg
                                    id="a"
                                    data-name="Layer 2"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 19 18">
                                    <rect
                                        x="2.5"
                                        y=".98"
                                        width="5.44"
                                        height="16.04"
                                        style={{
                                            fill: '#f2f4f7',
                                            strokeWidth: '0px',
                                        }}
                                    />
                                    <polygon
                                        points="9.04 1.61 11.95 17.39 17.29 16.4 14.39 .61 9.04 1.61"
                                        style={{
                                            fill: '#f2f4f7',
                                            strokeWidth: '0px',
                                        }}
                                    />
                                    <path
                                        d="M8.22,17.59H2.21c-.16,0-.28-.13-.28-.28V.7c0-.16.13-.28.28-.28h6.01c.16,0,.28.13.28.28v16.62c0,.14-.13.27-.28.27ZM2.5,17.02h5.44s0-16.04,0-16.04H2.5s0,16.04,0,16.04Z"
                                        style={{
                                            fill: '#022450',
                                            strokeWidth: '0px',
                                        }}
                                    />
                                    <path
                                        d="M7.1,6.49h-3.77c-.09,0-.14-.06-.14-.14V1.82c0-.09.06-.14.14-.14h3.77c.09,0,.14.06.14.14v4.53c0,.07-.07.14-.14.14ZM3.47,6.21h3.49s0-4.25,0-4.25h-3.49s0,4.25,0,4.25Z"
                                        style={{
                                            fill: '#022450',
                                            strokeWidth: '0px',
                                        }}
                                    />
                                    <path
                                        d="M5.22,16.03c-1.01,0-1.84-.82-1.84-1.84s.82-1.84,1.84-1.84,1.84.82,1.84,1.84-.84,1.84-1.84,1.84ZM5.22,12.64c-.85,0-1.56.69-1.56,1.56s.69,1.56,1.56,1.56,1.56-.69,1.56-1.56-.71-1.56-1.56-1.56Z"
                                        style={{
                                            fill: '#022450',
                                            strokeWidth: '0px',
                                        }}
                                    />
                                    <path
                                        d="M11.72,18c-.13,0-.26-.1-.28-.23L8.43,1.42c-.03-.16.07-.3.23-.33L14.56,0c.07-.01.16,0,.21.04s.1.11.11.18l3.02,16.34c.01.07,0,.16-.04.21s-.11.1-.18.11l-5.89,1.09s-.03.01-.06.01ZM9.04,1.61l2.9,15.78,5.34-.99L14.39.61l-5.34.99Z"
                                        style={{
                                            fill: '#022450',
                                            strokeWidth: '0px',
                                        }}
                                    />
                                    <path
                                        d="M10.84,6.88c-.07,0-.13-.04-.14-.11l-.82-4.46s0-.07.03-.1c.03-.03.06-.06.09-.06l3.71-.68c.07-.01.16.04.17.11l.81,4.45s0,.07-.03.1-.06.06-.09.06l-3.71.69h-.01ZM10.18,2.39l.77,4.18,3.43-.64-.77-4.18-3.43.64Z"
                                        style={{
                                            fill: '#022450',
                                            strokeWidth: '0px',
                                        }}
                                    />
                                    <path
                                        d="M14.12,15.95c-.86,0-1.64-.62-1.8-1.5-.09-.48.01-.98.3-1.37.28-.41.69-.68,1.18-.77.99-.18,1.96.48,2.14,1.47h0c.18.99-.48,1.96-1.47,2.14-.13.01-.24.03-.34.03ZM14.12,12.54c-.1,0-.18.01-.28.03-.41.07-.77.31-.99.65-.24.34-.33.75-.26,1.16.16.84.96,1.4,1.81,1.25.84-.16,1.4-.96,1.25-1.81-.14-.75-.79-1.28-1.53-1.28Z"
                                        style={{
                                            fill: '#022450',
                                            strokeWidth: '0px',
                                        }}
                                    />
                                </svg>
                            </div>
                            <span className={classes.navigation}>
                                Document locker
                            </span>
                        </div>
                    </Link>
                </li>
                <li
                    className={`${pathname.includes('/reporting') ? classes.active : classes.link}`}>
                    <Link href={`/reporting`}>
                        <div className={classes.button}>
                            <SealogsReportsIcon
                                className={`${classes.icons} m-auto lg:-ml-1 lg:mr-2 h-6 w-6`}
                            />
                            <span className={classes.navigation}>
                                Reporting
                            </span>
                        </div>
                    </Link>
                </li>
                <li>
                    <Link href={`/visualIndicator`}>
                        <div className={classes.button}>
                            <SealogsReportsIcon
                                className={`${classes.icons} m-auto lg:-ml-1 lg:mr-2 h-6 w-6`}
                            />
                            <span className={classes.navigation}>
                                VisualIndicator
                            </span>
                        </div>
                    </Link>
                </li>
            </ul>
        </>
    )
}
