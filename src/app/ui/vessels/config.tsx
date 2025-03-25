// #############################################################################
// Note: This file is too large to use prettier, please do not format this file.
// #############################################################################
'use client'

import { useEffect, useState } from 'react'
import {
    SLALL_LogBookFields,
    RequiredFields,
    vesselTypes,
} from '@/app/lib/vesselDefaultConfig'
import {
    UPDATE_CUSTOMISED_COMPONENT_FIELD,
    UPDATE_CUSTOMISED_LOGBOOK_COMPONENT,
    CREATE_CUSTOMISED_COMPONENT_FIELD,
    CREATE_CUSTOMISED_LOGBOOK_COMPONENT,
    UPDATE_CUSTOMISED_LOGBOOK_CONFIG,
    CreateCustomisedLogBookConfig,
} from '@/app/lib/graphQL/mutation'
import { useLazyQuery, useMutation } from '@apollo/client'
import { GET_LOGBOOK_CONFIG } from '@/app/lib/graphQL/query'
import {
    FooterWrapper,
    PopoverWrapper,
    SeaLogsButton,
} from '@/app/components/Components'
import { getVesselByID } from '@/app/lib/actions'
import { Button, DialogTrigger, Heading, Popover } from 'react-aria-components'
import { useRouter } from 'next/navigation'
import FileUpload from '../file-upload'
import toast, { Toaster } from 'react-hot-toast'
import { isCrew } from '@/app/helpers/userHelper'
import { classes as globalClasses } from '@/app/components/GlobalClasses'
import SlidingPanel from 'react-sliding-side-panel'
import 'react-sliding-side-panel/lib/index.css'
import { InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Editor from '../editor'
import {
    filterByVesselType,
    filterFieldByVesselType,
    sortTabs,
    tabClasses,
    classes,
    getYesCheckedStatus,
    getNoCheckedStatus,
    getGroupFields,
    getCategory,
    getLevelThreeCategory,
    getFieldsNotInConfig,
    subCategoryVisibilityCheck,
    isCategorised,
    getComponentsNotInConfig,
    isFileField,
    getFieldGroup,
    getTabTitle,
    getFieldName,
    isFieldInConfig,
    filterFieldClasses,
    fieldTitleFilter,
    isInLevel,
    getLevelThreeCategoryGroup,
    fieldIsGroup,
} from './actions'
import 'react-quill/dist/quill.snow.css'

export default function LogbookConfig({
    logBookID,
    vesselID,
}: {
    logBookID: number
    vesselID: number
}) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [logBookConfig, setLogBookConfig] = useState<any>(false)
    const [updatedFields, setUpdatedFields] = useState<any>([])
    const [updatedLocalFields, setUpdatedLocalFields] = useState<any>([])
    const [vessel, setVessel] = useState<any>(false)
    const [openConfigEditDialog, setOpenConfigEditDialog] = useState(false)
    const [currentField, setCurrentField] = useState<any>(false)
    const [openDescriptionPanel, setOpenDescriptionPanel] = useState(false)
    const [descriptionPanelContent, setDescriptionPanelContent] = useState('')
    const [descriptionPanelHeading, setDescriptionPanelHeading] = useState('')
    const [tab, setTab] = useState<any>(false)
    const [tabs, setTabs] = useState<any>()
    const [categoryTab, setCategoryTab] = useState<any>()
    const [categoryTabs, setCategoryTabs] = useState<any>()
    const [dailyCheckCategory, setDailyCheckCategory] = useState<any>(false)
    const [dailyCheckCategories, setDailyCheckCategories] = useState<any>(false)
    const [levelThreeCategories, setLevelThreeCategories] = useState<any>(false)
    const [levelThreeCategory, setLevelThreeCategory] = useState<any>(false)
    const [resetCounter, setResetCounter] = useState(-1)
    const [documents, setDocuments] = useState<Array<Record<string, any>>>([])
    const [saving, setSaving] = useState(false)
    const [notify, setNotify] = useState(true)
    const [imCrew, setImCrew] = useState(false)
    const [filteredFields, setFilteredFields] = useState<any>(false)
    const [content, setContent] = useState<any>('')

    const handleEditorChange = (newContent: any) => {
        setContent(newContent)
    }

    const handleSetVessel = (vessel: any) => {
        if (vessel?.vesselType) {
            const logbookFields = SLALL_LogBookFields.filter((field: any) => {
                if (field?.items?.length > 0) {
                    return field.vesselType.includes(vesselTypes.indexOf(vessel?.vesselType))
                }
                return false
            })
            var filteredFields: any = [];
            logbookFields.map((logbookField: any) => {
                var currentField = logbookField
                var currentFieldItems: any = []
                logbookField.items.map((fields: any) => {
                    if (fields.vesselType.includes(vesselTypes.indexOf(vessel?.vesselType))) {
                        if (vessel?.vesselSpecifics?.carriesDangerousGoods == false) {
                            if (fields.classes !== 'dangerous-goods-sailing') {
                                currentFieldItems.push(fields)
                            }
                        } else {
                            currentFieldItems.push(fields)
                        }
                    }
                })
                currentField.items = currentFieldItems
                filteredFields.push(currentField)
            })
            setFilteredFields(filteredFields)
        }
        setVessel(vessel)
        loadLogBookConfig()
    }

    getVesselByID(vesselID, handleSetVessel)

    const getSlallFields = () => {
        return filteredFields ? filteredFields : SLALL_LogBookFields
    }

    const [queryLogBookConfig] = useLazyQuery(GET_LOGBOOK_CONFIG, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = filterByVesselType(response.readOneCustomisedLogBookConfig, getSlallFields(), vesselTypes, vessel)
            if (data) {
                setUpdatedLocalFields([])
                setUpdatedFields([])
                setLogBookConfig(data)
                { data.policies.nodes.length > 0 && setDocuments(data.policies.nodes) }
                if (!tab) {
                    const tabs = data.customisedLogBookComponents?.nodes
                        .map((component: any) => ({
                            title: component.title,
                            category: component.category,
                            componentClass: component.componentClass,
                        }))
                        .sort()
                    const logbookFields = getSlallFields()
                    const config = data.customisedLogBookComponents.nodes
                    const defaultConfig = logbookFields.map(
                        (component: any) => component,
                    )
                    var componentsNotInConfig: any = []
                    defaultConfig.forEach((defaultLogBookComponents: any) => {
                        var found = false
                        config.forEach((customisedLogBookComponents: any) => {
                            if (customisedLogBookComponents.componentClass === defaultLogBookComponents.componentClass) {
                                found = true
                            }
                        })
                        if (!found) {
                            componentsNotInConfig.push(defaultLogBookComponents)
                        }
                    })
                    const additionalTabs = componentsNotInConfig.map((component: any) => ({ title: component.label, category: component.category, componentClass: component.componentClass }),)
                    setTabs(sortTabs([...tabs, ...additionalTabs], getSlallFields()))
                    setTab(tabs[0])
                    const categoryTabs: string[] = Array.from(
                        new Set<string>(
                            data.customisedLogBookComponents?.nodes.map(
                                (component: any) => component.category,
                            ),
                        ),
                    )
                    setCategoryTabs(categoryTabs)
                    setCategoryTab(categoryTabs[0])
                    var currentTab = false
                    tabs.forEach((element: any) => {
                        if (element.category === categoryTabs[0]) {
                            if (!currentTab) {
                                setTab(element.title)
                            }
                            currentTab = element.title
                        }
                    })
                }
            } else {
                createCustomisedLogBookConfig({
                    variables: {
                        input: {
                            customisedLogBookID: logBookID,
                        },
                    },
                })
            }
        },
        onError: (error: any) => {
            console.error('queryLogBookConfig error', error)
        },
    })

    const [createCustomisedLogBookConfig] = useMutation(
        CreateCustomisedLogBookConfig,
        {
            onCompleted: (response: any) => {
                const data = response.createCustomisedLogBookConfig
                loadLogBookConfig()
            },
            onError: (error: any) => {
                console.error('updateVessel error', error)
            },
        },
    )

    useEffect(() => {
        if (isLoading && vessel) {
            setImCrew(isCrew())
            loadLogBookConfig()
            setIsLoading(false)
            handleSetDailyCheckCategories()
            handleLevelThreeCategories()
        }
    }, [isLoading, vessel])

    const loadLogBookConfig = async () => {
        await queryLogBookConfig({
            variables: {
                id: +logBookID,
            },
        })
    }

    const updateFieldStatus = (field: any, status: string) => {
        if (field?.__typename && field.__typename === 'CustomisedComponentField') {
            const appendedData = [
                ...updatedFields.filter(
                    (updatedField: any) => updatedField.fieldID !== field.id,
                ),
                { fieldID: field.id, status: status },
            ]
            setUpdatedFields(appendedData)
            updateCustomisedComponentField({
                variables: {
                    input: {
                        id: field.id,
                        status: status,
                    },
                },
            })
            // if (getGroupFields(field.fieldName)) {
            //     getGroupFields(field.fieldName).forEach((groupedField: any) => {
            //         if (groupedField?.id) {
            //             updateCustomisedComponentField({
            //                 variables: {
            //                     input: {
            //                         id: groupedField.id,
            //                         status: status,
            //                     },
            //                 },
            //             })
            //         }
            //     })
            // }
        } else {
            setUpdatedLocalFields([
                ...updatedLocalFields.filter((updatedField: any) => updatedField.localID !== field.localID,),
                { ...field, status: status },
            ])
            createCustomisedComponentField({
                variables: {
                    input: {
                        customisedFieldTitle: field?.title ? field.title : field.value,
                        customisedLogBookComponentID: field.customisedLogBookComponentID,
                        fieldName: field.value,
                        status: status,
                        sortOrder: 0,
                    },
                },
            })
            // if (getGroupFields(field.value)) {
            //     getGroupFields(field.value).forEach((groupedField: any) => {
            //         if (!groupedField?.id) {
            //             createCustomisedComponentField({
            //                 variables: {
            //                     input: {
            //                         customisedFieldTitle: groupedField.value,
            //                         customisedLogBookComponentID: groupedField.customisedLogBookComponentID,
            //                         fieldName: groupedField.value,
            //                         status: status,
            //                         sortOrder: 0,
            //                     },
            //                 },
            //             })
            //         }
            //     })
            // }
        }
    }

    const [createCustomisedComponentField] = useMutation(
        CREATE_CUSTOMISED_COMPONENT_FIELD,
        {
            onCompleted: (response: any) => {
                const data = response.createCustomisedComponentField
                // loadLogBookConfig()
            },
            onError: (error: any) => {
                console.error('updateVessel error', error)
            },
        },
    )

    const [updateCustomisedComponentField] = useMutation(
        UPDATE_CUSTOMISED_COMPONENT_FIELD,
        {
            onCompleted: (response: any) => {
                const data = response.updateCustomisedComponentField
                if (resetCounter > 0) {
                    setResetCounter(resetCounter - 1)
                }
                if (resetCounter == 0) {
                    setResetCounter(resetCounter - 1)
                    loadLogBookConfig()
                }
            },
            onError: (error: any) => {
                console.error('updateVessel error', error)
            },
        },
    )

    const handleUpdateConfigEdit = () => {
        const customisedFieldTitle = (document.getElementById('field-name') as HTMLInputElement)?.value
        const sortOrder = (document.getElementById('field-sort-order') as HTMLInputElement)?.value
        updateCustomisedComponentField({
            variables: {
                input: {
                    id: currentField.id,
                    customisedFieldTitle: customisedFieldTitle,
                    sortOrder: +sortOrder,
                    description: content === '<p><br></p>' ? '' : content,
                },
            },
        })
        loadLogBookConfig()
        setOpenConfigEditDialog(false)
        handleEditorChange('')
    }

    const handleSetDailyCheckCategories = () => {
        const logbookFields = getSlallFields();
    
        const dailyCheckCategories = Array.from(
            new Set(
                logbookFields.filter((field: any) => field.subCategory).length > 0
                    ? logbookFields
                        .filter((field: any) => field.subCategory)[0]
                        .items
                        .filter((item: any) => item.level !== 3) // Exclude level 3 items
                        .map((item: any) => {
                            return item.fieldSet ? item.fieldSet : 'Other'; // Map main categories
                        })
                    : 'Other'
            )
        );
    
        setDailyCheckCategories(dailyCheckCategories.filter((category: any) => category !== 'Checks'
            && category !== 'Other' && category !== 'Documentation' && category !== 'Fuel Checks'))
        setDailyCheckCategory(dailyCheckCategories[0])
    };

    const handleLevelThreeCategories = () => {
        const logbookFields = getSlallFields()
        const levelThreeCategories: any = Array.from(
            new Set(
                logbookFields
                    .filter((field: any) => field.subCategory)[0]
                    .items.filter((field: any) => field.level === 3).map((field: any) => {
                        return {
                            fieldSet: field.fieldSet,
                            label: field.label,
                            status: field.status,
                        }
                    })
            ),
        )
        setLevelThreeCategories(levelThreeCategories)
        setLevelThreeCategory(levelThreeCategories[0].label)
    }

    const mapConfigToDefault = (currentComponent: any) => {
        const logbookFields = getSlallFields()
        setResetCounter(resetCounter + 1)
        const config = logBookConfig.customisedLogBookComponents.nodes
            .filter((component: any) => component.id == currentComponent.id)
            .map((component: any) => component)
        const defaultConfig = logbookFields.map((component: any) => component)
        config.forEach((customisedLogBookComponents: any) => {
            defaultConfig.forEach((defaultLogBookComponents: any) => {
                if (customisedLogBookComponents.componentClass === defaultLogBookComponents.componentClass) {
                    customisedLogBookComponents.customisedComponentFields.nodes
                        .filter((customFields: any, index: number, self: any[]) =>
                            self.findIndex((c: any) => c.fieldName === customFields.fieldName) === index
                        ).forEach(
                            (customFields: any) => {
                                defaultLogBookComponents.items.forEach(
                                    (defaultField: any) => {
                                        if (
                                            customFields.fieldName ===
                                            defaultField.value
                                        ) {
                                            const updatedField = updatedFields.find((updatedField: any) => updatedField.fieldID === customFields.id,)
                                            if (defaultField.status != customFields.status) {
                                                updateCustomisedComponentField({
                                                    variables: {
                                                        input: {
                                                            id: customFields.id,
                                                            status: defaultField.status,
                                                        },
                                                    },
                                                })
                                                setResetCounter(resetCounter + 1)
                                            }
                                            if (updatedField?.fieldID && updatedField?.status != defaultField.status) {
                                                updateCustomisedComponentField({
                                                    variables: {
                                                        input: {
                                                            id: customFields.id,
                                                            status: defaultField.status,
                                                        },
                                                    },
                                                })
                                                setResetCounter(resetCounter + 1)
                                            }
                                        }
                                    },
                                )
                            },
                        )
                }
            })
        })
    }

    const changeTab = (tab: string) => () => {
        setTab(tab?.replace('Logbook', 'LogBook'))
    }

    const changeCategoryTab = (tab: string) => () => {
        setCategoryTab(tab)
        var currentTab = false
        tabs.forEach((element: any) => {
            if (element.category.replace('Logbook', 'LogBook') === tab?.replace('Logbook', 'LogBook')) {
                if (!currentTab) {
                    setTab(element.title.replace('Logbook', 'LogBook'))
                }
                currentTab = element.title.replace('Logbook', 'LogBook')
            }
        })
    }

    const [updateCustomisedComponent] = useMutation(
        UPDATE_CUSTOMISED_LOGBOOK_COMPONENT,
        {
            onCompleted: (response: any) => {
                const data = response.updateCustomisedLogBookComponent
                loadLogBookConfig()
            },
            onError: (error: any) => {
                console.error('updateVessel error', error)
            },
        },
    )

    const activateCustomisedComponent = (id: number) => () => {
        updateCustomisedComponent({
            variables: {
                input: {
                    id: id,
                    active: true,
                },
            },
        })
    }

    const deactivateCustomisedComponent = (id: number) => () => {
        updateCustomisedComponent({
            variables: {
                input: {
                    id: id,
                    active: false,
                },
            },
        })
    }

    const activateCustomisedSubComponent = (component: any, category: string) => () => {
        if (component.subFields) {
            updateCustomisedComponent({
                variables: {
                    input: {
                        id: component.id,
                        subFields: component.subFields + '||' + category,
                    },
                },
            })
        } else {
            updateCustomisedComponent({
                variables: {
                    input: {
                        id: component.id,
                        subFields: dailyCheckCategories.concat(category).join('||'),
                    },
                },
            })
        }
    }

    const deactivateCustomisedSubComponent = (component: any, category: string) => () => {
        if (component.subFields) {
            updateCustomisedComponent({
                variables: {
                    input: {
                        id: component.id,
                        subFields: component.subFields.split('||').filter((field: any) => field !== category).join('||'),
                    },
                },
            })
        } else {
            updateCustomisedComponent({
                variables: {
                    input: {
                        id: component.id,
                        subFields: dailyCheckCategories.filter((cat: any) => cat != category).join('||'),
                    },
                },
            })
        }
    }

    const activateCustomisedLevelThreeComponent = (component: any, levelThree: any) => () => {
        if (component.subFields) {
            updateCustomisedComponent({
                variables: {
                    input: {
                        id: component.id,
                        subFields: component.subFields + '||' + levelThree.label,
                    },
                },
            })
        } else {
            updateCustomisedComponent({
                variables: {
                    input: {
                        id: component.id,
                        subFields: dailyCheckCategories.concat(levelThree.label).join('||'),
                    },
                },
            })
        }
        //if (levelThree?.status === 'disabled') {
            levelThreeCategories.map((category: any) => {
                if (category.label === levelThree.label) {
                    category.status = 'Enabled'
                }
                return category
            })
        //}
    }

    const deactivateCustomisedLevelThreeComponent = (component: any, levelThree: any) => () => {
        if (component.subFields) {
            updateCustomisedComponent({
                variables: {
                    input: {
                        id: component.id,
                        subFields: component.subFields.split('||').filter((field: any) => field !== levelThree.label).join('||'),
                    },
                },
            })
        } else {
            updateCustomisedComponent({
                variables: {
                    input: {
                        id: component.id,
                        subFields: dailyCheckCategories.filter((cat: any) => cat != levelThree.label).join('||'),
                    },
                },
            })
        }
        //if (levelThree?.status === 'enabled') {
            levelThreeCategories.map((category: any) => {
                if (category.label === levelThree.label) {
                    category.status = 'Disabled'
                }
                return category
            })
        //}
    }

    const changeDailyChecksCategoryTab = (tab: string) => () => {
        setDailyCheckCategory(tab)
    }

    const changeLevelThreeCategoryTab = (tab: string) => () => {
        setLevelThreeCategory(tab)
    }

    const [createCustomisedComponent] = useMutation(
        CREATE_CUSTOMISED_LOGBOOK_COMPONENT,
        {
            onCompleted: (response: any) => {
                const data = response.createCustomisedComponent
                loadLogBookConfig()
            },
            onError: (error: any) => {
                console.error('updateVessel error', error)
            },
        },
    )

    const isRequiredField = (field: any) => {
        if (field?.__typename && field.__typename === 'CustomisedComponentField') {
            const isRequired = RequiredFields.includes(field.fieldName) ? true : false
            if (isRequired && !getYesCheckedStatus(field, updatedFields, updatedLocalFields)) {
                updateFieldStatus(field, 'Required')
            }
            return isRequired
        } else {
            const isRequired = RequiredFields.includes(field.value) ? true : false
            if (isRequired && !getYesCheckedStatus(field, updatedFields, updatedLocalFields)) {
                if (
                    updatedLocalFields.filter((updatedField: any) => updatedField.localID !== field.localID,).length === 0
                ) {
                    createCustomisedComponentField({
                        variables: {
                            input: {
                                customisedFieldTitle: field?.title ? field.title : field.value,
                                customisedLogBookComponentID:
                                    field.customisedLogBookComponentID,
                                fieldName: field.value,
                                status: 'Required',
                            },
                        },
                    })
                }
                setUpdatedLocalFields([
                    ...updatedLocalFields.filter((updatedField: any) => updatedField.localID !== field.localID,),
                    { ...field, status: 'Required' },
                ])
            }
            return isRequired
        }
    }

    const handleSave = (notify = true) => {
        if (notify) {
            setSaving(true)
            toast.loading('Logbook configuration saving...')
        } else {
            setNotify(false)
        }
        const policies = documents.length > 0 ? documents?.map((doc: any) => +doc.id).join(',') : ''
        updateCustomisedLogBookConfig({
            variables: {
                input: {
                    id: logBookConfig.id,
                    policies: policies,
                },
            },
        })
        setIsLoading(true)
    }

    useEffect(() => {
        if (!isLoading && documents) {
            setNotify(false)
            handleSave(false)
        }
    }, [documents])

    const [updateCustomisedLogBookConfig] = useMutation(
        UPDATE_CUSTOMISED_LOGBOOK_CONFIG,
        {
            onCompleted: (response: any) => {
                const data = response.updateCustomisedLogBookConfig
                if (data.id > 0) {
                    if (notify) {
                        toast.dismiss()
                        toast.success('Logbook configuration saved')
                        setSaving(false)
                    }
                    setNotify(true)
                }
            },
            onError: (error: any) => {
                console.error('updateVessel error', error)
            },
        },
    )

    const filterFieldsWithGroup = (fields: any, componentClass: string) => {
        const logbookFields = getSlallFields()
        const defaultConfig = logbookFields.map((component: any) => component)
        var groupFields: any = []
        var groups: any = []
        defaultConfig.forEach((defaultLogBookComponents: any) => {
            if (tab?.replace('Logbook', 'LogBook') === defaultLogBookComponents.label.replace('Logbook', 'LogBook') && defaultLogBookComponents.componentClass === componentClass) {
                defaultLogBookComponents.items.forEach((defaultField: any) => {
                    if (defaultField.groupTo && defaultField.level !== 3) {
                        if (!groups.includes(defaultField.groupTo)) {
                            groups.push(defaultField.groupTo);
                        }
                    }
                });
            }
        });
        defaultConfig.forEach((defaultLogBookComponents: any) => {
            if (tab?.replace('Logbook', 'LogBook') === defaultLogBookComponents.label.replace('Logbook', 'LogBook')) {
                defaultLogBookComponents.items.forEach((defaultField: any, index: number) => {
                    groups.forEach((group: any) => {
                        if (defaultField.value === group && !isFieldInConfig(defaultField.value, logBookConfig, tab)) {
                            if (defaultField.level !== 3) {
                                groupFields.push({
                                    ...defaultField,
                                    description: null,
                                    fieldName: defaultField.value,
                                    id: index + '0',
                                    sortOrder: 1,
                                    status: defaultField.status,
                                });
                            }
                        }
                    });
                });
            }
        });
        // console.log(fields
        //     .filter((field: any) => filterFieldsWithGroupCombinedFilter(field))
        //     .sort((a: any, b: any) => a.sortOrder - b.sortOrder),
        //     fields.filter((field: any) => !getFieldGroup(field, getSlallFields(), tab))
        //         .filter((field: any) => filterFieldByVesselType(field, getSlallFields(), vesselTypes, vessel))
        //         .filter((field: any) => getGroupFields(field.fieldName, getSlallFields(), tab, logBookConfig) != false)
        //         .sort((a: any, b: any) => a.sortOrder - b.sortOrder))
        if (groups.length > 0) {
            const flatGroupFields = groupFields.flatMap((group: any) => group.value)
            return [...groupFields.map((group: any) => {
                let groupData = group
                fields.map((field: any) => {
                    if (group.value === field.fieldName) {
                        groupData = { ...group, ...field }
                    }
                })
                return groupData
            }), ...fields.filter((field: any) => !flatGroupFields.includes(field.fieldName))]
                .filter((field: any) => filterFieldsWithGroupCombinedFilter(field))
                .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
        }
        return fields
            .filter((field: any) => filterFieldsWithGroupCombinedFilter(field))
            .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
    }

    const filterFieldsWithGroupCombinedFilter = (field: any) => {
        if (field?.__typename && field.__typename === 'CustomisedComponentField') {
            const logbookFields = getSlallFields()
            const defaultConfig = logbookFields.map(
                (component: any) => component,
            )
            var group = false
            var returnField = false
            var groupFields = false
            defaultConfig.forEach((defaultLogBookComponents: any) => {
                if (tab?.replace('Logbook', 'LogBook') === defaultLogBookComponents.label.replace('Logbook', 'LogBook') || (defaultLogBookComponents.label === 'Crew Welfare' && tab === 'Crew Members')) {
                    if (defaultLogBookComponents.items.find((defaultField: any) => defaultField.groupTo === field.fieldName) !== undefined) { groupFields = true }
                    defaultLogBookComponents.items.forEach(
                        (defaultField: any) => {
                            if (field.fieldName === defaultField.value) {
                                group = defaultField?.groupTo
                                    ? defaultField.groupTo
                                    : false
                            }
                            if (field.fieldName === defaultField.value && defaultField.vesselType.includes(vesselTypes.indexOf(vessel?.vesselType)) &&
                            defaultField.level !== 3) {
                                returnField = field
                            }
                        },
                    )
                }
            })
            return group === false && returnField !== false && groupFields !== false
        } else {
            const logbookFields = getSlallFields()
            const defaultConfig = logbookFields.map((component: any) => component,)
            var group = false
            var returnField = false
            var groupFields = false
            defaultConfig.forEach((defaultLogBookComponents: any) => {
                if (tab?.replace('Logbook', 'LogBook') === defaultLogBookComponents.label.replace('Logbook', 'LogBook') || (defaultLogBookComponents.label === 'Crew Welfare' && tab === 'Crew Members')) {
                    if (defaultLogBookComponents.items.find((defaultField: any) => defaultField.groupTo === field.value) !== undefined) { groupFields = true }
                    defaultLogBookComponents.items.forEach(
                        (defaultField: any) => {
                            if (field.value === defaultField.value) {
                                group = defaultField?.groupTo
                                    ? defaultField.groupTo
                                    : false
                            }
                            if (field.value === defaultField.value && defaultField.vesselType.includes(vesselTypes.indexOf(vessel?.vesselType)) &&
                            defaultField.level !== 3) {
                                returnField = field
                            }
                        },
                    )
                }
            })
            return group === false && returnField !== false && groupFields !== false
        }
    }

    const customisedComponentFieldsCombinedFilter = (field: any) => {
        // console.log(fields.filter((customFields: any, index: number, self: any[]) => self.findIndex((c: any) => c.fieldName === customFields.fieldName) === index)
        // .filter((field: any) => filterFieldByVesselType(field, getSlallFields(), vesselTypes, vessel))
        // .filter((field: any) => !getFieldGroup(field, getSlallFields(), tab))
        // .filter((field: any) => getGroupFields(field.fieldName, getSlallFields(), tab, logBookConfig) == false)
        // .sort((a: any, b: any) => a.sortOrder - b.sortOrder))
        // return fields.filter((customFields: any) => filterFieldsWithGroupCombinedFilter(customFields))
        // .filter((field: any) => filterFieldByVesselType(field, getSlallFields(), vesselTypes, vessel))
        // .filter((field: any) => !getFieldGroup(field, getSlallFields(), tab))
        //     .filter((field: any) => getGroupFields(field.fieldName, getSlallFields(), tab, logBookConfig) != false)
        // .filter((field: any) => getGroupFields(field.fieldName, getSlallFields(), tab, logBookConfig) == false)
        // .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
        if (field?.__typename && field.__typename === 'CustomisedComponentField') {
            const logbookFields = getSlallFields()
            const defaultConfig = logbookFields.map(
                (component: any) => component,
            )
            var group = false
            var returnField = false
            var groupFields = false
            defaultConfig.forEach((defaultLogBookComponents: any) => {
                if (tab?.replace('Logbook', 'LogBook') === defaultLogBookComponents.label.replace('Logbook', 'LogBook') || (defaultLogBookComponents.label === 'Crew Welfare' && tab === 'Crew Members')) {
                    if (defaultLogBookComponents.items.find((defaultField: any) => defaultField.groupTo === field.fieldName) !== undefined) { groupFields = true }
                    defaultLogBookComponents.items.forEach(
                        (defaultField: any) => {
                            if (field.fieldName === defaultField.value) {
                                group = defaultField?.groupTo
                                    ? defaultField.groupTo
                                    : false
                            }
                            if (field.fieldName === defaultField.value && defaultField.vesselType.includes(vesselTypes.indexOf(vessel?.vesselType)) &&
                            defaultField.level !== 3) {
                                returnField = field
                            }
                        },
                    )
                }
            })
            return group === false && returnField !== false && groupFields == false
        } else {
            const logbookFields = getSlallFields()
            const defaultConfig = logbookFields.map((component: any) => component,)
            var group = false
            var returnField = false
            var groupFields = false
            defaultConfig.forEach((defaultLogBookComponents: any) => {
                if (tab?.replace('Logbook', 'LogBook') === defaultLogBookComponents.label.replace('Logbook', 'LogBook') || (defaultLogBookComponents.label === 'Crew Welfare' && tab === 'Crew Members')) {
                    if (defaultLogBookComponents.items.find((defaultField: any) => defaultField.groupTo === field.value) !== undefined) { groupFields = true }
                    defaultLogBookComponents.items.forEach(
                        (defaultField: any) => {
                            if (field.value === defaultField.value) {
                                group = defaultField?.groupTo
                                    ? defaultField.groupTo
                                    : false
                            }
                            if (field.value === defaultField.value && defaultField.vesselType.includes(vesselTypes.indexOf(vessel?.vesselType)) &&
                            defaultField.level !== 3) {
                                returnField = field
                            }
                        },
                    )
                }
            })
            return group === false && returnField !== false && groupFields == false
        }
    }

    const checkLevelThree = (field: any) => {
        if (getLevelThreeCategory(field, getSlallFields(), tab?.replace('Logbook', 'LogBook'))) {
            if (getLevelThreeCategory(field, getSlallFields(), tab?.replace('Logbook', 'LogBook')) === levelThreeCategory) {
                return true
            }
            return false
        }
        return true
    }

    const checkLevelThreeGroup = (field: any) => {
        const levelThreeCategoryGroup = getLevelThreeCategoryGroup(field, getSlallFields(), tab?.replace('Logbook', 'LogBook'))
        if (levelThreeCategoryGroup) {
            if (levelThreeCategoryGroup === levelThreeCategory) {
                return true
            }
            return false
        }
        return true
    }

    return (
        <div className='dark:bg-sldarkblue-800 mb-10'>
            <div className="flex items-center justify-between dark:text-slblue-200">
                <h1 className="my-4 text-2xl"> Logbook Configuration -{' '} <span className="text-xl">{vessel?.title}</span>{' '} </h1>
                <SeaLogsButton
                    text="Back to Vessel"
                    type="text"
                    className="hover:text-sllightblue-800"
                    icon="back_arrow"
                    color="slblue"
                    action={() => router.back()}
                />
            </div>
            <div className="border-t px-4">
                {logBookConfig && (
                    <div className={`my-4 dark:text-slblue-200`}> <label className="inline-block text-gray-500 dark:text-slblue-200 mr-4 w-32"> Vessel Title:{' '} </label> {vessel?.title} </div>
                )}
                {vessel && (
                    <div className={`my-4 dark:text-slblue-200`}> <label className="inline-block text-gray-500 dark:text-slblue-200 mr-4 w-32"> Vessel Type:{' '} </label> {vessel?.vesselType?.replaceAll('_', ' ')} </div>
                )}
            </div>
            {!isLoading && tabs && (
                <div className="">
                    {/* TODO: Remove this along with all its supported functions. */}
                    {/* <ul className="border-t flex mt-4 pt-2 px-4 flex-wrap text-sm font-medium text-center text-gray-500 dark:text-gray-400">
                            {categoryTabs.map((element: any) => (
                                <li className="me-2 my-1" key={element}>
                                    <Button
                                        className={`${
                                            categoryTab === element
                                                ? tabClasses.active
                                                : tabClasses.inactive
                                        }`}
                                        onPress={changeCategoryTab(element)}
                                    >
                                        {element.replaceAll('_', ' ')}
                                    </Button>
                                </li>
                            ))}
                        </ul> */}
                    <ul className="border-t flex mt-2 pt-2 px-4 flex-wrap text-sm font-medium text-center text-gray-500">
                        {tabs.filter((element: any) => element.title !== 'Crew Welfare' && element.title !== 'Crew Training' && element.componentClass !== 'Engine_LogBookComponent'
                            && element.componentClass !== 'Engineer_LogBookComponent' && element.componentClass !== 'Fuel_LogBookComponent' && element.componentClass !== 'Supernumerary_LogBookComponent',)
                            .map((element: any, index: number) => {
                                return (
                                    <li className="me-2 my-1" key={element.title + '-' + index}>
                                        <Button
                                            className={`${tab?.replace('Logbook', 'LogBook') === element.title.replace('Logbook', 'LogBook') ? tabClasses.active : tabClasses.inactive}`}
                                            onPress={changeTab(element.title,)}>
                                            {getTabTitle(element, SLALL_LogBookFields)}
                                        </Button>
                                    </li>
                                )
                            })}
                    </ul>
                    {logBookConfig.customisedLogBookComponents?.nodes.map(
                        (component: any) => (
                            <div key={component.id}
                                className={`border-t mt-2 grid grid-cols-3 pb-2 ${tab?.replace('Logbook', 'LogBook') === component.title.replace('Logbook', 'LogBook') || (tab === 'Crew Members' && component.title === 'Crew Welfare') || (tab === 'Engine Reports' && (component.componentClass === 'Engineer_LogBookComponent' || component.componentClass === 'Fuel_LogBookComponent')) ? '' : 'hidden'}`}>
                                <div className="flex flex-row md:flex-col items-center md:items-start justify-between col-span-3 md:col-span-1">
                                    <h2 className="text-xl p-4 mt-2 dark:text-slblue-200">
                                        {getTabTitle(component, SLALL_LogBookFields)}{' '}
                                        {component.active ? ('') : (
                                            <span className="text-gray-500"> {' '} - Inactive </span>
                                        )}
                                    </h2>
                                    {!isCategorised(component, getSlallFields(), logBookConfig) && !imCrew && (
                                        <div className="mt-2 p-4">
                                            {component.active ? (
                                                <>
                                                    <SeaLogsButton
                                                        text="Disable"
                                                        type="secondary"
                                                        color="rose"
                                                        action={deactivateCustomisedComponent(component.id,)}
                                                    />
                                                    <SeaLogsButton
                                                        type="secondary"
                                                        text="Reset default"
                                                        color="sky"
                                                        action={() => mapConfigToDefault(component,)}
                                                    />
                                                </>
                                            ) : (
                                                <SeaLogsButton
                                                    text="Enable"
                                                    type="secondary"
                                                    color="sky"
                                                    action={activateCustomisedComponent(component.id,)}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                                {isCategorised(component, getSlallFields(), logBookConfig) && (
                                    <>
                                        <div className="col-span-3">
                                            {dailyCheckCategories && (
                                                <ul className="border-t flex mt-1.5 p-4 flex-wrap text-sm font-medium text-center text-gray-500">
                                                    {dailyCheckCategories.map(
                                                        (category: any) => (
                                                            <li className="me-2 my-1" key={category}>
                                                                <Button
                                                                    className={`${dailyCheckCategory === category ? tabClasses.active : tabClasses.inactive}`}
                                                                    onPress={changeDailyChecksCategoryTab(category,)}>
                                                                    {category !== 'Engine Checks' ? category : 'Engine, steering, electrical & alt power'}
                                                                </Button>
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            )}
                                        </div>
                                        {levelThreeCategories && (
                                            <div className={`col-span-3 ${isInLevel(dailyCheckCategory, 3, getSlallFields()) ? '' : 'hidden'}`}>
                                                <ul className="border-t flex mt-1.5 p-4 flex-wrap text-sm font-medium text-center text-gray-500">
                                                    {levelThreeCategories.map(
                                                        (category: any) => (
                                                            <li className="me-2 my-1" key={category.label}>
                                                                <Button
                                                                    className={`${levelThreeCategory === category.label ? tabClasses.active : tabClasses.inactive}`}
                                                                    onPress={changeLevelThreeCategoryTab(category.label)}>
                                                                    {category.label}
                                                                </Button>
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            </div>
                                        )}
                                        {dailyCheckCategories && dailyCheckCategories.map((category: any, index: number) => (
                                            <div key={index} className={`flex flex-row md:flex-col items-center md:items-start justify-between col-span-3 md:col-span-1 ${dailyCheckCategory === category ? '' : 'hidden'}`}>
                                                <h2 className="text-xl p-4 mt-2 dark:text-slblue-200">
                                                    {category !== 'Engine Checks' ? category : 'Engine, steering, electrical & alt power'}{' '}
                                                    {component.active ? ('') : (
                                                        <span className="text-gray-500"> {' '} - Inactive </span>
                                                    )}
                                                </h2>
                                                {category !== 'Engine Checks' ? (
                                                    <div className="mt-2 p-4">
                                                        {(component.subFields == null || component?.subFields && component.subFields.split('||').includes(category)) && !imCrew ? (
                                                            <SeaLogsButton
                                                                text="Disable"
                                                                type="secondary"
                                                                color="rose"
                                                                action={deactivateCustomisedSubComponent(component, category)}
                                                            />
                                                        ) : (
                                                            <>
                                                                {!imCrew && (
                                                                    <SeaLogsButton
                                                                        text="Enable"
                                                                        type="secondary"
                                                                        color="sky"
                                                                        action={activateCustomisedSubComponent(component, category)}
                                                                    />
                                                                )}
                                                            </>

                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="mt-2 p-4">
                                                        {/* Level Three Categories Enable/Disable Buttons */}
                                                        {levelThreeCategories && levelThreeCategories.map((levelThree: any) => (
                                                            levelThree.label === levelThreeCategory && (
                                                            <div key={levelThree.label} className="mb-4">
                                                                {(component.subFields == null || component?.subFields && component.subFields.split('||').includes(levelThree.label)) && !imCrew ? (
                                                                    <SeaLogsButton
                                                                        text={`Disable`}
                                                                        type="secondary"
                                                                        color="rose"
                                                                        action={deactivateCustomisedLevelThreeComponent(component, levelThree)}
                                                                    />
                                                                ) : (
                                                                    <>
                                                                        {!imCrew && (
                                                                            <SeaLogsButton
                                                                                text={`Enable`}
                                                                                type="secondary"
                                                                                color="sky"
                                                                                action={activateCustomisedLevelThreeComponent(component, levelThree)}
                                                                            />
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                            )
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </>
                                )}
                                <div className="col-span-3 md:col-span-2 p-4 pb-0 1">
                                    {component.customisedComponentFields.nodes
                                        .filter((customFields: any, index: number, self: any[]) => self.findIndex((c: any) => c.fieldName === customFields.fieldName) === index)
                                        .filter((field: any) => customisedComponentFieldsCombinedFilter(field))
                                        .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                                        .map((field: any) => (
                                            <div key={field.id} className={`${filterFieldClasses(field, getSlallFields(), tab?.replace('Logbook', 'LogBook'))} ${isCategorised(component, getSlallFields(), logBookConfig) ? (dailyCheckCategory === getCategory(field, getSlallFields(), tab) && checkLevelThree(field) ? '' : 'hidden') : ''}`}>
                                                <div className={`${classes.fieldWrapper} px-4 ${subCategoryVisibilityCheck(component, tab?.replace('Logbook', 'LogBook'), dailyCheckCategory, levelThreeCategories, levelThreeCategory)} ${component.active ? '' : 'pointer-events-none opacity-50'} field - ${getCategory(field, getSlallFields(), tab)}`}>
                                                    <div className='flex items-center'>
                                                        <Button
                                                            className="text-left break-word cursor-pointer group-hover:text-emerald-600"
                                                            onPress={() => { setCurrentField(field), setOpenConfigEditDialog(true), handleEditorChange(field?.description) }}>
                                                            {field?.customisedFieldTitle ? fieldTitleFilter(field, getSlallFields(), tab?.replace('Logbook', 'LogBook')) : getFieldName(field, getSlallFields())}
                                                        </Button>
                                                        {field?.description && (
                                                            <SeaLogsButton
                                                                icon="alert"
                                                                className="w-6 h-6 sup -mt-2 ml-0.5"
                                                                action={() => {
                                                                    setDescriptionPanelContent(
                                                                        field.description,
                                                                    )
                                                                    setOpenDescriptionPanel(
                                                                        true,
                                                                    )
                                                                    setDescriptionPanelHeading(
                                                                        field?.customisedFieldTitle ? field.customisedFieldTitle : getFieldName(field, getSlallFields()),
                                                                    )
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                    {isRequiredField(field,) ? (
                                                        <div className="flex"> {' '} *This is a must have field </div>
                                                    ) : (
                                                        <div className={`flex`}>
                                                            <div className={classes.radio}>
                                                                <input
                                                                    id={`${field.id}-no_radio`}
                                                                    type="radio"
                                                                    disabled={imCrew}
                                                                    name={`${field.id}-radio`}
                                                                    className={classes.radioInput}
                                                                    checked={getNoCheckedStatus(field, updatedFields, updatedLocalFields)}
                                                                    onChange={() => { updateFieldStatus(field, 'Off',) }}
                                                                />
                                                                <label htmlFor={`${field.id}-no_radio`} className={classes.radioLabel}> No </label>
                                                            </div>
                                                            <div
                                                                className={classes.radio}>
                                                                <input
                                                                    id={`${field.id}-yes_radio`}
                                                                    type="radio"
                                                                    disabled={imCrew}
                                                                    name={`${field.id}-radio`}
                                                                    className={classes.radioInput}
                                                                    checked={getYesCheckedStatus(field, updatedFields, updatedLocalFields)}
                                                                    onChange={() => { updateFieldStatus(field, 'Required',) }}
                                                                />
                                                                <label htmlFor={`${field.id}-yes_radio`} className={classes.radioLabel}> Yes </label>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                {field?.fieldType === 'files' || (isFileField(field, getSlallFields(), tab?.replace('Logbook', 'LogBook')) && (
                                                    <div className={`${classes.fieldWrapper} px-4 ${component.active ? '' : 'pointer-events-none opacity-50'} ${getCategory(field, getSlallFields(), tab?.replace('Logbook', 'LogBook'))} ${isCategorised(component, getSlallFields(), logBookConfig) ? (dailyCheckCategory === field.fieldSet ? '' : 'hidden') : ''}`}>
                                                        <div></div>
                                                        <div className="colspan-3">
                                                            {documents.length > 0 && documents.map((doc: any, index: number,) => (
                                                                <div key={doc.id + '_' + index}>
                                                                    <div className="flex items-center w-full justify-between mb-2 uppercase">
                                                                        <span className="text-sm"> {doc.title} </span>
                                                                        <Button className="ms-2" onPress={() => { setDocuments(documents.filter((document: any,) => document.id !== doc.id,),) }}> &times; </Button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            <FileUpload setDocuments={setDocuments} text="Policies" documents={documents} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    {getFieldsNotInConfig(component, getSlallFields(), logBookConfig)
                                        .filter((field: any) => customisedComponentFieldsCombinedFilter(field))
                                        // .filter((field: any) => filterFieldByVesselType(field, getSlallFields(), vesselTypes, vessel))
                                        // ?.filter((field: any) => !getFieldGroup(field, getSlallFields(), tab))
                                        // .filter((field: any) => getGroupFields(field.value, getSlallFields(), tab, logBookConfig) == false)
                                        .map((field: any, index: number) => (
                                            <div key={field.value + '_' + index}
                                                className={`${filterFieldClasses(field, getSlallFields(), tab?.replace('Logbook', 'LogBook'))} ${isCategorised(component, getSlallFields(), logBookConfig) ? (dailyCheckCategory === (field?.fieldSet ? field.fieldSet : 'Other') && checkLevelThree(field) ? '' : 'hidden') : ''}`}>
                                                <div
                                                    className={`${classes.fieldWrapper} px-4 ${subCategoryVisibilityCheck(component, tab?.replace('Logbook', 'LogBook'), dailyCheckCategory, levelThreeCategories, levelThreeCategory)} ${component.active ? '' : 'pointer-events-none opacity-50'} ${getCategory(field, getSlallFields(), tab?.replace('Logbook', 'LogBook'))} `}>
                                                    <Button
                                                        className="text-left break-word"
                                                        onPress={() => {
                                                            toast.error(
                                                                'Please activate the field by selecting an option!',
                                                            )
                                                        }}>
                                                        {getFieldName(field, getSlallFields())}
                                                    </Button>
                                                    {isRequiredField({ ...field, localID: index, customisedLogBookComponentID: component.id, status: 'Required', }) ? (
                                                        <div className="flex"> {' '} *This is a must have field </div>
                                                    ) : (
                                                        <div className={`flex`}>
                                                            <div className={classes.radio}>
                                                                <input
                                                                    id={`default_field-${index}-no_radio`}
                                                                    type="radio"
                                                                    disabled={imCrew}
                                                                    name={`default_field-${index}-radio`}
                                                                    className={classes.radioInput}
                                                                    checked={getNoCheckedStatus({ ...field, localID: index, status: 'Off', }, updatedFields, updatedLocalFields)}
                                                                    onChange={() => { updateFieldStatus({ ...field, customisedLogBookComponentID: component.id, }, 'Off',) }}
                                                                />
                                                                <label htmlFor={`default_field-${index}-no_radio`} className={classes.radioLabel}> No </label>
                                                            </div>
                                                            <div
                                                                className={classes.radio}>
                                                                <input
                                                                    id={`default_field-${index}-yes_radio`}
                                                                    type="radio"
                                                                    disabled={imCrew}
                                                                    name={`default_field-${index}-radio`}
                                                                    className={classes.radioInput}
                                                                    checked={getYesCheckedStatus({ ...field, localID: index, customisedLogBookComponentID: component.id, status: 'Required', }, updatedFields, updatedLocalFields)}
                                                                    onChange={() => { updateFieldStatus({ ...field, customisedLogBookComponentID: component.id, }, 'Required',) }}
                                                                />
                                                                <label htmlFor={`default_field-${index}-yes_radio`} className={classes.radioLabel}> Yes </label>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                {field?.fieldType === 'files' && (
                                                    <div className={`${classes.fieldWrapper} px-4 ${component.active ? '' : 'pointer-events-none opacity-50'} ${getCategory(field, getSlallFields(), tab?.replace('Logbook', 'LogBook'))} ${isCategorised(component, getSlallFields(), logBookConfig) ? (dailyCheckCategory === field.fieldSet ? '' : 'hidden') : ''}`}>
                                                        <div></div>
                                                        <div className="colspan-3">
                                                            {documents.length > 0 && documents.map((doc: any, index: number,) => (
                                                                <div key={doc.id + '_' + index}>
                                                                    <div className="flex items-center w-full justify-between mb-2 uppercase">
                                                                        <span className="text-sm"> {doc.title} </span>
                                                                        <Button
                                                                            className="ms-2"
                                                                            onPress={() => { setDocuments(documents.filter((document: any,) => document.id !== doc.id,),) }}>
                                                                            &times;
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {!imCrew && (
                                                                <FileUpload setDocuments={setDocuments} text="Policies" documents={documents} />
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ),
                                        )}
                                </div>
                                <div className="col-span-3 p-4">
                                    {filterFieldsWithGroup(component.customisedComponentFields.nodes
                                        .filter((customFields: any, index: number, self: any[]) => self.findIndex((c: any) => c.fieldName === customFields.fieldName) === index), component.componentClass)
                                        .map(
                                            (field: any, index: number) => (
                                                <div key={field.id}
                                                    className={`${subCategoryVisibilityCheck(component, tab?.replace('Logbook', 'LogBook'), dailyCheckCategory, levelThreeCategories, levelThreeCategory)} ${isCategorised(component, getSlallFields(), logBookConfig) ? (dailyCheckCategory === getCategory(field, getSlallFields(), tab?.replace('Logbook', 'LogBook')) && checkLevelThreeGroup(field) ? '' : 'hidden') : ''} border rounded-lg mb-4`}>
                                                    <div className={`${classes.fieldWrapper} px-4 ${component.active ? '' : 'pointer-events-none opacity-50'} field - ${getCategory(field, getSlallFields(), tab?.replace('Logbook', 'LogBook'))} md:!grid-cols-3 lg:!grid-cols-3`}>
                                                        <div>
                                                            <div className='flex items-center'>
                                                                {field?.id > 0 ?
                                                                    <Button
                                                                        className="text-left break-word cursor-pointer"
                                                                        onPress={() => { setCurrentField(field), setOpenConfigEditDialog(true), handleEditorChange(field?.description) }}>
                                                                        {field?.customisedFieldTitle ? field.customisedFieldTitle : getFieldName(field, getSlallFields())}
                                                                    </Button>
                                                                    :
                                                                    <Button
                                                                        className="text-left break-word cursor-pointer"
                                                                        onPress={() => { toast.error('Please activate the group field by selecting an option!') }}>
                                                                        {field?.customisedFieldTitle ? field.customisedFieldTitle : getFieldName(field, getSlallFields())}
                                                                    </Button>}
                                                                {field?.description && (
                                                                    <SeaLogsButton
                                                                        icon="alert"
                                                                        className="w-6 h-6 sup -mt-2 ml-0.5"
                                                                        action={() => {
                                                                            setDescriptionPanelContent(
                                                                                field.description,
                                                                            )
                                                                            setOpenDescriptionPanel(
                                                                                true,
                                                                            )
                                                                            setDescriptionPanelHeading(
                                                                                field?.customisedFieldTitle ? field.customisedFieldTitle : getFieldName(field, getSlallFields()),
                                                                            )
                                                                        }}
                                                                    />
                                                                )}
                                                            </div>
                                                            {isRequiredField({ ...field, customisedLogBookComponentID: component.id }) ? (
                                                                <div className="flex mt-4"> {' '} *This is a must have group </div>
                                                            ) : (
                                                                <div className={`flex mt-4 ${field?.noCheck ? 'hidden' : ''}`}>
                                                                    <div className={classes.radio}>
                                                                        <input
                                                                            id={`${index}-group-no_radio`}
                                                                            type="radio"
                                                                            disabled={imCrew}
                                                                            name={`${index}-group-radio`}
                                                                            className={classes.radioInput}
                                                                            checked={getNoCheckedStatus({ ...field, localID: index, customisedLogBookComponentID: component.id }, updatedFields, updatedLocalFields)}
                                                                            onChange={() => { updateFieldStatus({ ...field, customisedLogBookComponentID: component.id }, 'Off') }} />
                                                                        <label htmlFor={`${index}-group-no_radio`} className={classes.radioLabel}> No </label>
                                                                    </div>
                                                                    <div className={classes.radio}>
                                                                        <input
                                                                            id={`${index}-group-yes_radio`}
                                                                            type="radio"
                                                                            disabled={imCrew}
                                                                            name={`${index}-group-radio`}
                                                                            className={classes.radioInput}
                                                                            checked={getYesCheckedStatus({ ...field, localID: index, customisedLogBookComponentID: component.id }, updatedFields, updatedLocalFields)}
                                                                            onChange={() => { updateFieldStatus({ ...field, customisedLogBookComponentID: component.id }, 'Required') }} />
                                                                        <label htmlFor={`${index}-group-yes_radio`} className={classes.radioLabel}> Yes </label>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            {getGroupFields(field.fieldName, getSlallFields(), tab?.replace('Logbook', 'LogBook'), logBookConfig).map((groupField: any, index: number) => (
                                                                <div key={groupField.value + '_' + index}
                                                                    className={`${classes.fieldWrapper} px-4 ${groupField?.id} ${component.active ? '' : 'pointer-events-none opacity-50 77'} ${getCategory(groupField, getSlallFields(), tab?.replace('Logbook', 'LogBook'))}`}>
                                                                    <div className='flex items-center'>
                                                                        {groupField?.id > 0 ?
                                                                            <Button
                                                                                className="text-left break-word cursor-pointer"
                                                                                onPress={() => { setCurrentField(groupField), setOpenConfigEditDialog(true), handleEditorChange(groupField?.description) }}>
                                                                                {groupField?.customisedFieldTitle ? groupField.customisedFieldTitle : getFieldName(groupField, getSlallFields())}
                                                                            </Button>
                                                                            :
                                                                            <Button
                                                                                className="text-left break-word cursor-pointer"
                                                                                onPress={() => { toast.error('Please activate the field by selecting an option!') }}>
                                                                                {groupField?.customisedFieldTitle ? groupField.customisedFieldTitle : getFieldName(groupField, getSlallFields())}
                                                                            </Button>}
                                                                        {groupField?.description && (
                                                                            <SeaLogsButton
                                                                                icon="alert"
                                                                                className="w-6 h-6 sup -mt-2 ml-0.5"
                                                                                action={() => {
                                                                                    setDescriptionPanelContent(
                                                                                        groupField.description,
                                                                                    )
                                                                                    setOpenDescriptionPanel(
                                                                                        true,
                                                                                    )
                                                                                    setDescriptionPanelHeading(
                                                                                        groupField?.customisedFieldTitle ? groupField.customisedFieldTitle : getFieldName(groupField, getSlallFields()),
                                                                                    )
                                                                                }}
                                                                            />
                                                                        )}
                                                                    </div>
                                                                    {isRequiredField(groupField) ? (
                                                                        <div className="flex"> {' '} *This is a must have field </div>
                                                                    ) : (
                                                                        <div className={`flex`}>
                                                                            <div className={classes.radio}>
                                                                                <input
                                                                                    id={`${groupField?.id ? groupField.id : groupField.value + '_' + index}-no_radio`}
                                                                                    type="radio"
                                                                                    disabled={imCrew}
                                                                                    name={`${groupField?.id ? groupField.id : groupField.value + '_' + index}-radio`}
                                                                                    className={classes.radioInput}
                                                                                    defaultChecked={getNoCheckedStatus(groupField, updatedFields, updatedLocalFields)}
                                                                                    onChange={() => { updateFieldStatus(groupField, 'Off') }} />
                                                                                <label htmlFor={`${groupField?.id ? groupField.id : groupField.value + '_' + index}-no_radio`} className={classes.radioLabel}>No</label>
                                                                            </div>
                                                                            <div className={classes.radio}>
                                                                                <input
                                                                                    id={`${groupField?.id ? groupField.id : groupField.value + '_' + index}-yes_radio`}
                                                                                    type="radio"
                                                                                    disabled={imCrew}
                                                                                    name={`${groupField?.id ? groupField.id : groupField.value + '_' + index}-radio`}
                                                                                    className={classes.radioInput}
                                                                                    defaultChecked={getYesCheckedStatus(groupField, updatedFields, updatedLocalFields)}
                                                                                    onChange={() => { updateFieldStatus(groupField, 'Required') }} />
                                                                                <label htmlFor={`${groupField?.id ? groupField.id : groupField.value + '_' + index}-yes_radio`} className={classes.radioLabel}> Yes </label>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    <div></div>
                                                                    {groupField?.fieldType === 'files' || (isFileField(groupField, getSlallFields(), tab?.replace('Logbook', 'LogBook')) && (
                                                                        <div className={`group grid py-1.5 items-start dark:text-slblue-200 ${component.active ? '' : 'pointer-events-none opacity-50'} ${getCategory(groupField, getSlallFields(), tab?.replace('Logbook', 'LogBook'))} ${isCategorised(component, getSlallFields(), logBookConfig) ? (dailyCheckCategory === groupField.fieldSet ? '' : 'hidden') : ''}`}>
                                                                            <div>
                                                                                {documents.length > 0 && documents.map((doc: any, index: number,) => (
                                                                                    <div key={doc.id + '_' + index}>
                                                                                        <div className="flex items-center w-full justify-between mb-2 uppercase"> <span className="text-sm"> {doc.title} </span>
                                                                                            <Button className="ms-2" onPress={() => { setDocuments(documents.filter((document: any,) => document.id !== doc.id,),) }}> &times; </Button>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                                <FileUpload setDocuments={setDocuments} text="Policies" documents={documents} />
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ),
                                                            )}
                                                        </div>
                                                    </div>
                                                    {field?.fieldType === 'files' || (isFileField(field, getSlallFields(), tab) && (
                                                        <div className={`${classes.fieldWrapper} px-4 ${component.active ? '' : 'pointer-events-none opacity-50'} ${getCategory(field, getSlallFields(), tab?.replace('Logbook', 'LogBook'))} ${isCategorised(component, getSlallFields(), logBookConfig) ? (dailyCheckCategory === field.fieldSet ? '' : 'hidden') : ''}`}>
                                                            <div></div>
                                                            <div className="colspan-3">
                                                                {documents.length > 0 && documents.map((doc: any, index: number,) => (
                                                                    <div key={doc.id + '_' + index}>
                                                                        <div className="flex items-center w-full justify-between mb-2 uppercase"> <span className="text-sm"> {doc.title} </span>
                                                                            <Button className="ms-2" onPress={() => { setDocuments(documents.filter((document: any,) => document.id !== doc.id,),) }}> &times; </Button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                <FileUpload setDocuments={setDocuments} text="Policies" documents={documents} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ),
                                        )}
                                </div>
                            </div>
                        ),
                    )}
                    {getComponentsNotInConfig(getSlallFields(), logBookConfig)?.map((component: any) => (
                        <div
                            key={component.label}
                            className={`mt-2 grid grid-cols-3 pb-2 border-t ${component.label} ${tab} mt-2 ${tab?.replace('Logbook', 'LogBook') === component.label.replace('Logbook', 'LogBook') || (component.label === 'Crew Welfare' && tab === 'Crew Members') || (tab === 'Engine Reports' && (component.componentClass === 'Engineer_LogBookComponent' || component.componentClass === 'Fuel_LogBookComponent')) ? '' : 'hidden'}`}>
                            <div className="flex flex-col justify-between">
                                <h2 className="text-xl p-4 mt-2"> {component.label} <span className="text-gray-500"> {' '} - Does not Exist </span> </h2>
                                {!isCategorised(component, getSlallFields(), logBookConfig) && (
                                    <div className="mt-2 p-4">
                                        {!imCrew && (
                                            <SeaLogsButton
                                                type="secondary"
                                                text={`Add ${component.label}`}
                                                icon="check"
                                                color="sky"
                                                action={() => {
                                                    createCustomisedComponent({
                                                        variables: {
                                                            input: {
                                                                title: component.label,
                                                                sortOrder: 0,
                                                                category: component.category,
                                                                customisedLogBookConfigID: logBookConfig.id,
                                                                componentClass: component.componentClass,
                                                                active: true,
                                                            },
                                                        },
                                                    })
                                                }}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="col-span-3 md:col-span-2 p-4 pb-0">
                                {component.items.map(
                                    (field: any, index: number) => (
                                        <div
                                            key={field.value + '_' + index}
                                            className={`${classes.fieldWrapper} px-4 pointer-events-none opacity-50`}>
                                            <Button className="text-left break-word">
                                                {field.value}
                                            </Button>
                                            <div className="flex">
                                                <div className={classes.radio}>
                                                    <input
                                                        id={`default_field-${index}-no_radio`}
                                                        type="radio"
                                                        disabled={imCrew}
                                                        name={`default_field-${index}-radio`}
                                                        className={classes.radioInput}
                                                        checked={false}
                                                        onChange={() => { console.log('no') }}
                                                    />
                                                    <label htmlFor={`default_field-${index}-no_radio`} className={classes.radioLabel}> No </label>
                                                </div>
                                                <div className={classes.radio}>
                                                    <input
                                                        id={`default_field-${index}-yes_radio`}
                                                        type="radio"
                                                        disabled={imCrew}
                                                        name={`default_field-${index}-radio`}
                                                        className={classes.radioInput}
                                                        checked={false}
                                                        onChange={() => { console.log('yes') }}
                                                    />
                                                    <label htmlFor={`default_field-${index}-yes_radio`} className={classes.radioLabel}> Yes </label>
                                                </div>
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <FooterWrapper>
                <SeaLogsButton
                    text="Cancel"
                    type="text"
                    action={() => { router.back() }}
                />
                {!isLoading && tabs && logBookConfig.customisedLogBookComponents?.nodes.length > 0 && logBookConfig.customisedLogBookComponents?.nodes.map(
                    (component: any) => (
                        <div key={component.id} className={`${tab?.replace('Logbook', 'LogBook') === component.title.replace('Logbook', 'LogBook') ? '' : 'hidden'}`}>
                            {isCategorised(component, getSlallFields(), logBookConfig) && (
                                <>
                                    {component.active ? (
                                        <>
                                            {!imCrew && (
                                                <>
                                                    <SeaLogsButton
                                                        text="Disable"
                                                        type="secondary"
                                                        color="rose"
                                                        action={deactivateCustomisedComponent(
                                                            component.id,
                                                        )}
                                                    />
                                                    <SeaLogsButton
                                                        type="secondary"
                                                        text="Reset default"
                                                        color="sky"
                                                        action={() =>
                                                            mapConfigToDefault(
                                                                component,
                                                            )
                                                        }
                                                    />
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            {!imCrew && (
                                                <SeaLogsButton
                                                    text="Enable"
                                                    type="secondary"
                                                    color="sky"
                                                    action={activateCustomisedComponent(
                                                        component.id,
                                                    )}
                                                />
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    ),
                )}
                {!isLoading &&
                    tabs &&
                    getComponentsNotInConfig(getSlallFields(), logBookConfig)?.map((component: any) => (
                        <div
                            key={component.label}
                            className={`${tab?.replace('Logbook', 'LogBook') === component.label.replace('Logbook', 'LogBook') ? '' : 'hidden'}`}>
                            {!imCrew && (
                                <SeaLogsButton
                                    type="secondary"
                                    text={`Add ${component.label}`}
                                    icon="check"
                                    color="sky"
                                    action={() => {
                                        createCustomisedComponent({
                                            variables: {
                                                input: {
                                                    title: component.label,
                                                    sortOrder: 0,
                                                    category: component.category,
                                                    customisedLogBookConfigID: logBookConfig.id,
                                                    componentClass: component.componentClass,
                                                    active: true,
                                                },
                                            },
                                        })
                                    }}
                                />
                            )}
                        </div>
                    ))}
                {!imCrew && (
                    <SeaLogsButton text={saving ? 'Saving' : 'Save'} type="primary" icon="check" color="sky" action={handleSave} />
                )}
            </FooterWrapper>
            <SlidingPanel type={'right'} isOpen={openConfigEditDialog} size={40}>
                <div className="h-[calc(100vh_-_1rem)] pt-4">
                    {openConfigEditDialog && (
                        <div className="bg-sllightblue-50 h-full flex flex-col justify-between rounded-l-lg">
                            <div className="text-xl dark:text-white text-white items-center flex justify-between font-medium py-4 px-6 rounded-tl-lg bg-slblue-1000">
                                <Heading slot="title" className="text-lg font-semibold leading-6 my-2 text-white">
                                    Field - {' '}
                                    <span className='font-thin'>
                                        {currentField?.customisedFieldTitle ? currentField?.customisedFieldTitle : currentField?.fieldName}
                                    </span>
                                </Heading>
                                <XMarkIcon className="w-6 h-6" onClick={() => setOpenConfigEditDialog(false)} />
                            </div>
                            <div className="p-4 flex-grow overflow-scroll">
                                <div className="">
                                    <div className="">
                                        <div slot="content" className="mb-4">
                                            {!fieldIsGroup(currentField, getSlallFields(), tab?.replace('Logbook', 'LogBook')) && (
                                                <>
                                                    <input type="text" id="field-name" placeholder="Customised Field Name (Optional)" className={globalClasses.inputSlidingPanel} defaultValue={currentField?.customisedFieldTitle} />
                                                    <input type="number" id="field-sort-order" placeholder="Sort Order" className={`${globalClasses.inputSlidingPanel} mt-4`} defaultValue={currentField?.sortOrder} />
                                                </>
                                            )}
                                            <Heading className="text-lg leading-loose font-medium mt-4 text-gray-700 dark:text-white">Procedure description </Heading>
                                            <Editor id="field-description" placeholder="Description (Optional)" className={`${globalClasses.editorSlidingPanel} mt-2`} content={content} handleEditorChange={handleEditorChange} />
                                        </div>
                                        <SeaLogsButton
                                            text="Save"
                                            type="primary"
                                            color="sky"
                                            icon="check"
                                            action={handleUpdateConfigEdit}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </SlidingPanel>
            <SlidingPanel type={'left'} isOpen={openDescriptionPanel} size={40}>
                <div className="h-[calc(100vh_-_1rem)] pt-4">
                    {openDescriptionPanel && (
                        <div className="bg-sllightblue-50 h-full flex flex-col justify-between rounded-r-lg">
                            <div className="text-xl dark:text-white text-white items-center flex justify-between py-4 px-6 rounded-tr-lg bg-slblue-1000">
                                <Heading
                                    slot="title"
                                    className="text-lg font-semibold leading-6 my-2 text-white dark:text-slblue-200">
                                    Field - {' '}
                                    <span className='font-thin'>
                                        {descriptionPanelHeading}
                                    </span>
                                </Heading>
                                <XMarkIcon
                                    className="w-6 h-6"
                                    onClick={() => {
                                        setOpenDescriptionPanel(false)
                                        setDescriptionPanelContent('')
                                        setDescriptionPanelHeading('')
                                    }}
                                />
                            </div>
                            <div className="text-xl p-4 flex-grow overflow-scroll">
                                <div
                                    className='text-xs leading-loose font-light'
                                    dangerouslySetInnerHTML={{
                                        __html: descriptionPanelContent,
                                    }}></div>
                            </div>
                        </div>
                    )}
                </div>
            </SlidingPanel>
            <Toaster position="top-right" />
        </div>
    )
}
