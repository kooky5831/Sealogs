import { DefaultDailyCheckFields } from '@/app/lib/defaultFields'
import { Button, DialogTrigger, Popover } from 'react-aria-components'
import { SLALL_LogBookFields } from '@/app/lib/vesselDefaultConfig'
import toast from 'react-hot-toast'
import { PopoverWrapper, SeaLogsButton } from '@/app/components/Components'

export const getDailyCheckNotification = (
    fields: any,
    logBookConfig: any,
    vesselDailyCheck: any,
    currentCategory: string,
    setTab: any,
) => {
    const sortedFields = fields.filter(
        (field: any) =>
            field.checked == null && displayField(field.name, logBookConfig),
    )
    const changeTab = (tab: string) => () => {
        toast.remove('dailyCheckToast')
        setTab(tab)
    }
    var incompleteCount =
        sortedFields.filter((field: any) => fieldIsGroup(field, logBookConfig))
            .length +
        sortedFields
            .filter((field: any) => !fieldIsGroup(field, logBookConfig))
            .filter((field: any) => !isInGroup(field, logBookConfig)).length
    const dailyCheckStatus = getDailyCheckStatus(
        logBookConfig,
        vesselDailyCheck,
    )
    const categories = Array.from(
        new Set(dailyCheckStatus.map((item) => item.category)),
    )
    const categoriesCompleted = Array.from(
        new Set(DefaultDailyCheckFields.map((component: any) => component.tab)),
    ).filter((item: any) => !categories.includes(item))
    return (
        <div
            className={`max-w-sm w-full border ${incompleteCount > 0 ? 'bg-rose-100 border-rose-600' : 'bg-sky-100 border-sky-600'} shadow-lg rounded-lg pointer-events-auto dark:bg-gray-800 dark:text-white`}>
            <div className="p-4 pr-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-6">
                            {currentCategory}{' '}
                            {incompleteCount > 0
                                ? ' - Incomplete'
                                : ' - Completed'}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            {incompleteCount > 0
                                ? 'Please complete remaining - ' +
                                  incompleteCount +
                                  ' fields'
                                : currentCategory +
                                  ' has been saved successfully'}
                        </p>
                        {/* {categoriesCompleted
                            .filter(
                                (category: any) => currentCategory != category,
                            )
                            .map((category: any) => (
                                <div
                                    key={category}
                                    className="mt-1 text-sm text-emerald-700">
                                    <Button onPress={changeTab(category)}>
                                        {category} - Completed
                                    </Button>
                                </div>
                            ))} */}
                        {categories
                            .filter(
                                (category: any) => currentCategory != category,
                            )
                            .map((category) => (
                                <div
                                    key={category}
                                    className="mt-1 text-sm text-gray-500">
                                    <Button onPress={changeTab(category)}>
                                        {category === 'Engine Checks'
                                            ? 'Engine, Propulsion, steering, electrical & alt power'
                                            : category}{' '}
                                        - Incomplete{' '}
                                        {
                                            dailyCheckStatus.filter(
                                                (field: any) =>
                                                    field.category === category,
                                            ).length
                                        }{' '}
                                        fields remaining
                                    </Button>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
            <Button
                className="absolute top-2 right-4 font-bold text-xl"
                onPress={() => setTab(currentCategory)}>
                &times;
            </Button>
        </div>
    )
}

export const isInGroup = (field: any, logBookConfig: any) => {
    const logbookFields = SLALL_LogBookFields
    const defaultConfig = logbookFields.map((component: any) => component)
    var groups: any = []
    defaultConfig.forEach((defaultLogBookComponents: any) => {
        if (
            'VesselDailyCheck_LogBookComponent' ===
            defaultLogBookComponents.componentClass
        ) {
            defaultLogBookComponents.items.forEach((defaultField: any) => {
                if (
                    defaultField.value === field.name &&
                    defaultField.groupTo != undefined
                ) {
                    groups.includes(defaultField.groupTo)
                        ? null
                        : groups.push(defaultField.groupTo)
                }
            })
        }
    })
    return groups.length > 0
}

export const fieldIsGroup = (field: any, logBookConfig: any) => {
    const logbookFields = SLALL_LogBookFields
    const defaultConfig = logbookFields.map((component: any) => component)
    var groups: any = []
    defaultConfig.forEach((defaultLogBookComponents: any) => {
        if (
            'VesselDailyCheck_LogBookComponent' ===
            defaultLogBookComponents.componentClass
        ) {
            defaultLogBookComponents.items.forEach((defaultField: any) => {
                if (defaultField.groupTo === field.name) {
                    groups.includes(defaultField.groupTo)
                        ? null
                        : groups.push(defaultField.groupTo)
                }
            })
        }
    })
    return groups.length > 0
}

export const getDailyCheckStatus = (
    logBookConfig: any,
    vesselDailyCheck: any,
) => {
    const dailyChecks =
        logBookConfig?.customisedLogBookComponents?.nodes?.filter(
            (node: any) =>
                node.componentClass === 'VesselDailyCheck_LogBookComponent',
        )
    const emptyFields: any[] = []
    DefaultDailyCheckFields.map((component: any) => {
        component.items.map((item: any) => {
            dailyChecks[0]?.customisedComponentFields?.nodes.map(
                (field: any) => {
                    if (
                        field.fieldName === item.name &&
                        field.status !== 'Off' &&
                        vesselDailyCheck?.[item.value] == null &&
                        subComponentVisibilityCheck(
                            component.tab,
                            logBookConfig,
                        )
                    ) {
                        emptyFields.push({
                            value: item.value,
                            category: component.tab,
                        })
                    }
                },
            )
        })
    })
    return emptyFields
}

export const subComponentVisibilityCheck = (
    category: string,
    logBookConfig: any,
) => {
    if (logBookConfig) {
        const components = logBookConfig.customisedLogBookComponents.nodes.find(
            (c: any) =>
                c.componentClass === 'VesselDailyCheck_LogBookComponent',
        )
        if (components?.subFields === null) return ''
        if (
            components?.subFields == '' ||
            components?.subFields?.split('||').includes(category)
        ) {
            return true
        }
        return false
    }
    return false
}

export const displayDescription = (fieldName: string, logBookConfig: any) => {
    const dailyChecks =
        logBookConfig?.customisedLogBookComponents?.nodes?.filter(
            (node: any) =>
                node.componentClass === 'VesselDailyCheck_LogBookComponent',
        )
    if (
        dailyChecks?.length > 0 &&
        dailyChecks[0]?.customisedComponentFields?.nodes.filter(
            (field: any) =>
                field.fieldName === fieldName && field.status !== 'Off',
        ).length > 0
    ) {
        const description =
            dailyChecks[0]?.customisedComponentFields?.nodes.filter(
                (field: any) =>
                    field.fieldName === fieldName && field.status !== 'Off',
            )[0].description
        return description
    }
    return false
}

export const composeField = (fieldName: string, logBookConfig: any) => {
    var composedField: { fleldID: any; fieldName: any }[] = []
    const dailyChecks =
        logBookConfig?.customisedLogBookComponents?.nodes?.filter(
            (node: any) =>
                node.componentClass === 'VesselDailyCheck_LogBookComponent',
        )
    if (
        dailyChecks?.length > 0 &&
        dailyChecks[0]?.customisedComponentFields?.nodes.map((field: any) =>
            field.fieldName === fieldName
                ? composedField.push({
                      fleldID: field.id,
                      fieldName: field.fieldName,
                  })
                : '',
        )
    ) {
        return composedField
    }
    return false
}

export const displayField = (fieldName: string, logBookConfig: any) => {
    const dailyChecks =
        logBookConfig?.customisedLogBookComponents?.nodes?.filter(
            (node: any) =>
                node.componentClass === 'VesselDailyCheck_LogBookComponent',
        )
    if (
        dailyChecks?.length > 0 &&
        dailyChecks[0]?.customisedComponentFields?.nodes.filter(
            (field: any) =>
                field.fieldName === fieldName && field.status !== 'Off',
        ).length > 0
    ) {
        return true
    }
    return false
}

export const getFieldLabel = (
    fieldName: string,
    logBookConfig: any,
    componentClass: string = 'VesselDailyCheck_LogBookComponent',
) => {
    const signOff = logBookConfig?.customisedLogBookComponents?.nodes?.filter(
        (node: any) => node.componentClass === componentClass,
    )
    if (signOff?.length > 0) {
        return signOff[0]?.customisedComponentFields?.nodes.find(
            (field: any) => field.fieldName === fieldName,
        )?.customisedFieldTitle
            ? signOff[0]?.customisedComponentFields?.nodes.find(
                  (field: any) => field.fieldName === fieldName,
              )?.customisedFieldTitle
            : fieldName
    }
    return fieldName
}

export const getFilteredFields = (
    fields: any,
    grouped = true,
    logBookConfig: any = false,
) => {
    const logbookFields = SLALL_LogBookFields
    const defaultConfig = logbookFields.map((component: any) => component)
    var groupFields: any = []
    var nonGroupFields: any = []
    var groups: any = []
    defaultConfig.forEach((defaultLogBookComponents: any) => {
        if (
            'VesselDailyCheck_LogBookComponent' ===
            defaultLogBookComponents.componentClass
        ) {
            defaultLogBookComponents.items.forEach((defaultField: any) => {
                fields.forEach((field: any) => {
                    if (field.name === defaultField.value) {
                        if (defaultField.groupTo != undefined) {
                            groupFields.push({
                                ...field,
                                groupTo: defaultField.groupTo,
                            })
                            groups.includes(defaultField.groupTo)
                                ? null
                                : groups.push(defaultField.groupTo)
                        } else {
                            nonGroupFields.push(field)
                        }
                    }
                })
            })
        }
    })
    if (grouped) {
        const groupedFields = groups.map((group: any) => {
            const fields = groupFields
                .filter(
                    (field: any) =>
                        field.groupTo === group &&
                        displayField(field.name, logBookConfig),
                )
                .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
            return {
                name: group,
                field: getFieldByName(group),
                items: fields,
                sortOrder: logBookConfig
                    ? getSortOrder(group, logBookConfig)
                    : 0,
            }
        })
        if (
            groupedFields.reduce(
                (acc: any, curr: any) => acc + curr.items.length,
                0,
            ) > 0
        ) {
            return groupedFields.sort(
                (a: any, b: any) => a.sortOrder - b.sortOrder,
            )
        }
        return null
    }
    return nonGroupFields
        .filter((field: any) => !groups?.includes(field.name))
        .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
}

export const getFieldByName = (name: string) => {
    const logbookFields = SLALL_LogBookFields
    const defaultConfig = logbookFields.map((component: any) => component)
    var groupField: any = []
    defaultConfig.forEach((defaultLogBookComponents: any) => {
        if (
            'VesselDailyCheck_LogBookComponent' ===
            defaultLogBookComponents.componentClass
        ) {
            defaultLogBookComponents.items.forEach((defaultField: any) => {
                if (defaultField.value === name) {
                    groupField.push(defaultField)
                }
            })
        }
    })
    return groupField[0]
}

export const getSortOrder = (title: any, logBookConfig: any) => {
    const logbookFields = logBookConfig
    const defaultConfig = logbookFields.customisedLogBookComponents.nodes.map(
        (component: any) => component,
    )
    var sortOrder = 0
    defaultConfig.forEach((component: any) => {
        component.customisedComponentFields.nodes.map((field: any) => {
            if (title === field.fieldName) {
                sortOrder = field.sortOrder
            }
        })
    })
    return sortOrder
}

export const displayDescriptionIcon = (content: string) => {
    return (
        <DialogTrigger>
            <SeaLogsButton icon="alert" className="w-6 h-6 sup -mt-2 ml-0.5" />
            <Popover>
                <PopoverWrapper>
                    <div className="text-sm my-2">
                        <div
                            dangerouslySetInnerHTML={{
                                __html: content,
                            }}></div>
                    </div>
                </PopoverWrapper>
            </Popover>
        </DialogTrigger>
    )
}
