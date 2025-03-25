import { usePathname } from 'next/navigation'
import VesselDropdown from '../ui/vessels/dropdown'
import TrainingTypeDropdown from '../ui/training-type/dropdown'
import CrewDropdown from '../ui/crew/dropdown'
import DateRange from './DateRange'
import CrewDutyDropdown from '../ui/crew-duty/dropdown'
import { debounce } from 'lodash'
import SupplierDropdown from '../ui/inventory/supplier-dropdown'
import CategoryDropdown from '../ui/inventory/category-dropdown'
import MaintenanceCategoryDropdown from '../ui/maintenance/category-dropdown'
import Select from 'react-select'
import { useEffect, useState } from 'react'
import { SeaLogsButton } from '@/app/components/Components'
import { classes } from './GlobalClasses'
const Filter = ({
    onChange,
    vesselIdOptions = [],
    trainingTypeIdOptions = [],
    memberId = 0,
    trainerIdOptions = [],
    memberIdOptions = [],
    supplierIdOptions = [],
    categoryIdOptions = [],
    onClick,
    crewData,
    vesselData,
}: any) => {
    const pathname = usePathname()
    const [selectedOptions, setSelectedOptions] = useState({
        vessel: null,
        supplier: null,
        category: null,
    })
    const [filteredOptions, setFilteredOptions] = useState({
        vesselIdOptions,
        supplierIdOptions,
        categoryIdOptions,
    })

    const handleOnChange = ({ type, data }: any) => {
        const newSelectedOptions = { ...selectedOptions, [type]: data }
        setSelectedOptions(newSelectedOptions)

        filterOptions(newSelectedOptions)

        onChange({ type, data })
    }

    const filterOptions = (selectedOptions: any) => {
        let newSupplierIdOptions = supplierIdOptions
        let newCategoryIdOptions = categoryIdOptions

        if (selectedOptions.vessel) {
            newSupplierIdOptions = supplierIdOptions.filter((supplier: any) => {
                return supplier.vesselId === selectedOptions.vessel.id
            })
        }

        if (selectedOptions.supplier) {
            newCategoryIdOptions = categoryIdOptions.filter((category: any) => {
                return category.supplierId === selectedOptions.supplier.id
            })
        }

        setFilteredOptions({
            vesselIdOptions: vesselIdOptions,
            supplierIdOptions: newSupplierIdOptions,
            categoryIdOptions: newCategoryIdOptions,
        })
    }

    const handleOnClick = () => {
        onClick()
    }
    return (
        <div className="p-4 bg-sllightblue-100 border border-sllightblue-200 rounded-md dark:text-slblue-200 my-4">
            <label className={`${classes.label}`}>Filter</label>
            <div className="flex flex-col md:flex-row md:items-center relative z-20 justify-items-stretch">
                {(pathname === '/crew-training' ||
                    pathname === '/crew/info') && (
                    <TrainingListFilter
                        onChange={handleOnChange}
                        vesselIdOptions={vesselIdOptions}
                        trainingTypeIdOptions={trainingTypeIdOptions}
                        memberId={memberId}
                        trainerIdOptions={trainerIdOptions}
                        memberIdOptions={memberIdOptions}
                    />
                )}
                {pathname === '/crew' && (
                    <CrewListFilter onChange={handleOnChange} />
                )}
                {pathname === '/inventory' && (
                    <InventoryListFilter 
                        onChange={handleOnChange}
                        vesselIdOptions={filteredOptions.vesselIdOptions}
                        supplierIdOptions={filteredOptions.supplierIdOptions}
                        categoryIdOptions={filteredOptions.categoryIdOptions}
                    />
                )}
                {pathname === '/inventory/suppliers' && (
                    <SupplierListFilter onChange={handleOnChange} />
                )}
                {pathname === '/maintenance' && (
                    <MaintenanceListFilter onChange={handleOnChange} />
                )}
                {pathname === '/training-type' && (
                    <TrainingTypeListFilter onChange={handleOnChange} />
                )}
                {pathname === '/reporting' && (
                    <ReporingFilters
                        onChange={handleOnChange}
                        onClickButton={handleOnClick}
                        crewData={crewData}
                        vesselData={vesselData}
                    />
                )}
                {(pathname === '/reporting/fuel-analysis' ||
                    pathname === '/reporting/fuel-tasking-analysis' ||
                    pathname === '/reporting/detailed-fuel-report' ||
                    pathname === '/reporting/fuel-summary-report') && (
                    <FuelReporingFilters onChange={handleOnChange} />
                )}
                {pathname === '/document-locker' && (
                    <DocumentLockerFilter onChange={handleOnChange} />
                )}
                {pathname === '/calendar' && (
                    <CalendarFilter onChange={handleOnChange} />
                )}
            </div>
        </div>
    )
}

export default Filter

const TrainingListFilter = ({
    onChange,
    vesselIdOptions = [],
    trainingTypeIdOptions = [],
    memberId = 0,
    trainerIdOptions = [],
    memberIdOptions = [],
}: any) => {
    const handleDropdownChange = (type: string, data: any) => {
        onChange({ type, data })
    }
    return (
        <div className="flex flex-col md:flex-row gap-2">
            <div>
                <VesselDropdown
                    isClearable={true}
                    onChange={(data: any) =>
                        handleDropdownChange('vessel', data)
                    }
                    vesselIdOptions={vesselIdOptions}
                />
            </div>
            <div>
                <TrainingTypeDropdown
                    isClearable={true}
                    onChange={(data: any) =>
                        handleDropdownChange('trainingType', data)
                    }
                    trainingTypeIdOptions={trainingTypeIdOptions}
                />
            </div>
            <div>
                <CrewDropdown
                    isClearable={true}
                    controlClasses="filter"
                    onChange={(data: any) =>
                        handleDropdownChange('trainer', data)
                    }
                    filterByTrainingSessionMemberId={memberId}
                    trainerIdOptions={trainerIdOptions}
                />
            </div>
            <div>
                <CrewDropdown
                    isClearable={true}
                    controlClasses="filter"
                    placeholder="Crew"
                    onChange={(data: any) =>
                        handleDropdownChange('member', data)
                    }
                    filterByTrainingSessionMemberId={memberId}
                    memberIdOptions={memberIdOptions}
                />
            </div>
            <div>
                <DateRange
                    className="border border-slblue-200"
                    onChange={(data: any) =>
                        handleDropdownChange('dateRange', data)
                    }
                />
            </div>
        </div>
    )
}
const CrewListFilter = ({ onChange }: any) => {
    const handleDropdownChange = (type: string, data: any) => {
        onChange({ type, data })
    }
    return (
        <div className="flex flex-col md:flex-row gap-2">
            <div>
                <VesselDropdown
                    isClearable={true}
                    onChange={(data: any) =>
                        handleDropdownChange('vessel', data)
                    }
                />
            </div>
            <div>
                <CrewDutyDropdown
                    crewDutyID={0}
                    controlClasses="filter"
                    isClearable={true}
                    menuPlacement="bottom"
                    onChange={(data: any) => {
                        handleDropdownChange('crewDuty', data)
                    }}
                />
            </div>
            <div>
                <SearchInput
                    onChange={(data: any) => {
                        handleDropdownChange('keyword', data)
                    }}
                />
            </div>
        </div>
    )
}

const SearchInput = ({ onChange }: any) => {
    const debouncedOnChange = debounce(onChange, 600)

    const handleChange = (e: any) => {
        debouncedOnChange({ value: e.target.value })
    }
    return (
        <div>
            <input
                type="search"
                className={`${classes.input} w-full`}
                placeholder="Search..."
                onChange={handleChange}
            />
        </div>
    )
}

const InventoryListFilter = ({ onChange, vesselIdOptions, supplierIdOptions, categoryIdOptions }: any) => {
    const handleDropdownChange = (type: string, data: any) => {
        onChange({ type, data })
    }
    return (
        <div className="flex flex-col md:flex-row gap-2">
            <div>
                <VesselDropdown
                    isClearable={true}
                    vesselIdOptions={vesselIdOptions}
                    onChange={(data: any) =>
                        handleDropdownChange('vessel', data)
                    }
                />
            </div>
            <div>
                <SupplierDropdown
                    isClearable={true}
                    supplierIdOptions={supplierIdOptions}
                    onChange={(data: any) =>
                        handleDropdownChange('supplier', data)
                    }
                />
            </div>
            <div>
                <CategoryDropdown
                    isClearable={true}
                    categoryIdOptions={categoryIdOptions}
                    onChange={(data: any) =>
                        handleDropdownChange('category', data)
                    }
                />
            </div>
            <div>
                <SearchInput
                    onChange={(data: any) => {
                        handleDropdownChange('keyword', data)
                    }}
                />
            </div>
        </div>
    )
}
const SupplierListFilter = ({ onChange }: any) => {
    const handleDropdownChange = (type: string, data: any) => {
        onChange({ type, data })
    }
    return (
        <div className="flex flex-col md:flex-row gap-2">
            <div>
                <SearchInput
                    onChange={(data: any) => {
                        handleDropdownChange('keyword', data)
                    }}
                />
            </div>
        </div>
    )
}
const MaintenanceListFilter = ({ onChange }: any) => {
    const handleDropdownChange = (type: string, data: any) => {
        onChange({ type, data })
    }
    return (
        <div className="flex flex-col md:flex-row gap-2">
            <div>
                <VesselDropdown
                    isClearable={true}
                    onChange={(data: any) =>
                        handleDropdownChange('vessel', data)
                    }
                />
            </div>
            <div>
                <MaintenanceCategoryDropdown
                    isClearable={true}
                    onChange={(data: any) =>
                        handleDropdownChange('category', data)
                    }
                />
            </div>
            <div>
                <MaintenanceStatusDropdown
                    onChange={(data: any) =>
                        handleDropdownChange('status', data)
                    }
                />
            </div>
            <div>
                <CrewDropdown
                    isClearable={true}
                    controlClasses="filter"
                    placeholder="Crew"
                    onChange={(data: any) =>
                        handleDropdownChange('member', data)
                    }
                />
            </div>
            {/*<div>
                <DateRange
                    className='border border-slblue-200'
                    onChange={(data: any) =>
                        handleDropdownChange('dateRange', data)
                    }
                />
            </div>*/}
            <div>
                <SearchInput
                    onChange={(data: any) => {
                        handleDropdownChange('keyword', data)
                    }}
                />
            </div>
        </div>
    )
}
const MaintenanceStatusDropdown = ({ onChange }: any) => {
    const [isLoading, setIsLoading] = useState(true)
    const statusOptions = [
        { value: 'Open', label: 'Open' },
        { value: 'Save_As_Draft', label: 'Save as Draft' },
        { value: 'In_Progress', label: 'In Progress' },
        { value: 'On_Hold', label: 'On Hold' },
        { value: 'Completed', label: 'Completed' },
    ]

    useEffect(() => {
        setIsLoading(false)
    }, [])

    return (
        <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3">
            <div className="flex items-center">
                {statusOptions && !isLoading && (
                    <Select
                        id="supplier-dropdown"
                        closeMenuOnSelect={true}
                        options={statusOptions}
                        menuPlacement="top"
                        // defaultValue={selectedSupplier}
                        // value={selectedSupplier}
                        onChange={onChange}
                        isClearable={true}
                        className={classes.selectMain}
                        placeholder="Status"
                        classNames={{
                            control: () => classes.selectControl + ' w-full',
                            singleValue: () => classes.selectSingleValue,
                            menu: () => classes.selectMenu,
                            option: () => classes.selectOption,
                        }}
                        styles={{
                            container: (provided) => ({
                                ...provided,
                                width: '100%',
                            }),
                        }}
                    />
                )}
            </div>
        </div>
    )
}
const TrainingTypeListFilter = ({ onChange }: any) => {
    const handleDropdownChange = (type: string, data: any) => {
        onChange({ type, data })
    }
    return (
        <div className="flex flex-col md:flex-row gap-2">
            <div>
                <VesselDropdown
                    isClearable={true}
                    onChange={(data: any) =>
                        handleDropdownChange('vessel', data)
                    }
                />
            </div>
            <div>
                <SearchInput
                    onChange={(data: any) => {
                        handleDropdownChange('keyword', data)
                    }}
                />
            </div>
        </div>
    )
}
const ReporingFilters = ({
    onChange,
    onClickButton,
    crewData,
    vesselData,
}: any) => {
    const handleDropdownChange = (type: string, data: any) => {
        onChange({ type, data })
    }

    const [crewIsMulti, setCrewIsMulti] = useState(true)
    const [vesselIsMulti, setVesselIsMulti] = useState(true)

    const getReport = () => {
        onClickButton()
    }

    useEffect(() => {
        if (crewData.length > 1) {
            setVesselIsMulti(false)
        } else {
            setVesselIsMulti(true)
        }

        if (vesselData.length > 1) {
            setCrewIsMulti(false)
        } else {
            setCrewIsMulti(true)
        }
    }, [crewData, vesselData])
    return (
        <div className="flex flex-col md:flex-row gap-2">
            <div className="mr-2">
                <CrewDropdown
                    isClearable={true}
                    controlClasses="filter"
                    placeholder="Crew"
                    onChange={(data: any) =>
                        handleDropdownChange('member', data)
                    }
                    isMulti={crewIsMulti}
                />
            </div>
            <div className="mr-2">
                <VesselDropdown
                    isClearable={true}
                    onChange={(data: any) =>
                        handleDropdownChange('vessel', data)
                    }
                    isMulti={vesselIsMulti}
                />
            </div>
            <div className="mr-2">
                <DateRange
                    className="border border-slblue-200"
                    onChange={(data: any) =>
                        handleDropdownChange('dateRange', data)
                    }
                />
            </div>
            <div className="mr-2">
                <SeaLogsButton
                    text={'Report'}
                    type="primary"
                    color="sky"
                    icon="check"
                    action={getReport}
                />
            </div>
        </div>
    )
}
const FuelReporingFilters = ({ onChange }: any) => {
    const handleDropdownChange = (type: string, data: any) => {
        onChange({ type, data })
    }

    return (
        <div className="flex flex-col md:flex-row gap-2">
            <div className="mr-2">
                <VesselDropdown
                    isClearable={true}
                    onChange={(data: any) =>
                        handleDropdownChange('vessel', data)
                    }
                />
            </div>
            <div className="mr-2">
                <DateRange
                    className="border border-slblue-200"
                    onChange={(data: any) =>
                        handleDropdownChange('dateRange', data)
                    }
                />
            </div>
        </div>
    )
}
const DocumentLockerFilter = ({ onChange }: any) => {
    const handleDropdownChange = (type: string, data: any) => {
        onChange({ type, data })
    }
    return (
        <div className="flex flex-col md:flex-row gap-2">
            <div className="mr-2">
                <VesselDropdown
                    isClearable={true}
                    onChange={(data: any) =>
                        handleDropdownChange('vessel', data)
                    }
                />
            </div>
            <div className="mr-2">
                <DocumentModuleDropdown
                    onChange={(module: any, data: any) => {
                        handleDropdownChange('Module', data)
                    }}
                />
            </div>

            <div>
                <SearchInput
                    onChange={(data: any) => {
                        handleDropdownChange('keyword', data)
                    }}
                />
            </div>
        </div>
    )
}
const DocumentModuleDropdown = ({ onChange }: any) => {
    const [isLoading, setIsLoading] = useState(true)
    const statusOptions = [
        { value: 'Vessel', label: 'Vessel' },
        { value: 'Maintenance', label: 'Maintenance' },
        { value: 'Inventory', label: 'Inventory' },
        { value: 'Company', label: 'Company' },
    ]

    useEffect(() => {
        setIsLoading(false)
    }, [])

    return (
        <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3">
            <div className="flex items-center">
                {statusOptions && !isLoading && (
                    <Select
                        id="document-module-dropdown"
                        closeMenuOnSelect={true}
                        options={statusOptions}
                        menuPlacement="top"
                        // defaultValue={selectedSupplier}
                        // value={selectedSupplier}
                        onChange={(element) => {
                            onChange('Module', element)
                        }}
                        isClearable={true}
                        className={classes.selectMain}
                        placeholder="Module"
                        classNames={{
                            control: () => classes.selectControl + ' w-full',
                            singleValue: () => classes.selectSingleValue,
                            menu: () => classes.selectMenu,
                            option: () => classes.selectOption,
                        }}
                    />
                )}
            </div>
        </div>
    )
}
const CalendarModuleDropdpown = ({ onChange }: any) => {
    const [isLoading, setIsLoading] = useState(true)
    const statusOptions = [
        { value: 'Task', label: 'Maintenance' },
        { value: 'Completed Training', label: 'Completed Training' },
        { value: 'Training Due', label: 'Training Due' },
        { value: 'Log Book Entry', label: 'Log Book Entry' },
    ]

    useEffect(() => {
        setIsLoading(false)
    }, [])

    return (
        <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3">
            <div className="flex items-center">
                {statusOptions && !isLoading && (
                    <Select
                        id="document-module-dropdown"
                        closeMenuOnSelect={true}
                        options={statusOptions}
                        menuPlacement="top"
                        // defaultValue={selectedSupplier}
                        // value={selectedSupplier}
                        onChange={(element) => {
                            onChange('Module', element)
                        }}
                        isClearable={true}
                        className={classes.selectMain}
                        placeholder="Module"
                        classNames={{
                            control: () => classes.selectControl + ' w-full',
                            singleValue: () => classes.selectSingleValue,
                            menu: () => classes.selectMenu,
                            option: () => classes.selectOption,
                        }}
                    />
                )}
            </div>
        </div>
    )
}

const CalendarFilter = ({ onChange }: any) => {
    const handleDropdownChange = (type: string, data: any) => {
        onChange({ type, data })
    }
    return (
        <div className="flex flex-col md:flex-row gap-2">
            <div className="mr-2">
                <VesselDropdown
                    isClearable={true}
                    onChange={(data: any) =>
                        handleDropdownChange('vessel', data)
                    }
                />
            </div>
            <div className="lg:mr-2 md:mr-2">
                <CrewDropdown
                    isClearable={true}
                    controlClasses="filter"
                    placeholder="Crew"
                    onChange={(data: any) =>
                        handleDropdownChange('member', data)
                    }
                />
            </div>
            <div className="mr-2">
                <CalendarModuleDropdpown
                    onChange={(module: any, data: any) => {
                        handleDropdownChange('Module', data)
                    }}
                />
            </div>
        </div>
    )
}