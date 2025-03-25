export const filterFieldByVesselType = (
    field: any,
    getSlallFields: any,
    vesselTypes: any,
    vessel: any,
) => {
    const logbookFields = getSlallFields
    var returnField = false
    if (field?.__typename && field.__typename === 'CustomisedComponentField') {
        logbookFields.map((component: any) =>
            component.items.map((item: any) => {
                if (
                    field.fieldName === item.value &&
                    item.vesselType.includes(
                        vesselTypes.indexOf(vessel?.vesselType),
                    )
                ) {
                    returnField = field
                }
            }),
        )
        return returnField
    } else {
        logbookFields.map((component: any) =>
            component.items.map((item: any) => {
                if (
                    field.value === item.value &&
                    item.vesselType.includes(
                        vesselTypes.indexOf(vessel?.vesselType),
                    )
                ) {
                    returnField = field
                }
            }),
        )
        return returnField
    }
}

export const filterByVesselType = (
    data: any,
    getSlallFields: any,
    vesselTypes: any,
    vessel: any,
) => {
    if (data && vessel.vesselType) {
        const logbookFields = getSlallFields
        const defaultConfig = logbookFields.map((component: any) => component)
        var filteredData: any = {
            ...data,
            customisedLogBookComponents: {
                ...data.customisedLogBookComponents,
                nodes: data.customisedLogBookComponents.nodes.filter(
                    (component: any) => {
                        var found = false
                        defaultConfig.forEach(
                            (defaultLogBookComponents: any) => {
                                if (
                                    component.componentClass ===
                                        defaultLogBookComponents.componentClass &&
                                    defaultLogBookComponents.vesselType.includes(
                                        vesselTypes.indexOf(vessel.vesselType),
                                    )
                                ) {
                                    found = true
                                }
                            },
                        )
                        return found
                    },
                ),
            },
        }
        // var filteredFields: any = [];
        // filteredData.customisedLogBookComponents.nodes.map((logbookField: any) => {
        //     var currentField = logbookField
        //     var currentFieldItems: any = []
        //     logbookField.items.map((fields: any) => {
        //         if (fields.vesselType.includes(vesselTypes.indexOf(vessel?.vesselType))) {
        //             currentFieldItems.push(fields)
        //         }
        //     })
        //     currentField.items = currentFieldItems
        //     filteredFields.push(currentField)
        // })
        // console.log(filteredData)
        return filteredData
    }
    return data
}

export const getSortOrder = (title: any, getSlallFields: any) => {
    const logbookFields = getSlallFields
    const defaultConfig = logbookFields.map((component: any) => component)
    var sortOrder = 0
    defaultConfig.forEach((defaultLogBookComponents: any) => {
        if (title.componentClass === defaultLogBookComponents.componentClass) {
            sortOrder = defaultLogBookComponents?.sortOrder
                ? defaultLogBookComponents?.sortOrder
                : 99
        }
    })
    return sortOrder
}

export const sortTabs = (tabs: any, getSlallFields: any) => {
    return tabs.sort((a: any, b: any) => {
        if (getSortOrder(a, getSlallFields) > getSortOrder(b, getSlallFields)) {
            return 1
        }
        if (getSortOrder(a, getSlallFields) < getSortOrder(b, getSlallFields)) {
            return -1
        }
        return 0
    })
}

export const classes = {
    fieldWrapper:
        'group grid py-1.5 grid-cols-2 lg:grid-cols-2 items-start dark:text-slblue-200',
    radio: 'flex items-center me-4',
    radioInput:
        'w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600',
    radioLabel: 'ms-2 text-sm font-medium text-gray-900 dark:text-slblue-200',
}

export const tabClasses = {
    active: 'inline-flex items-center px-4 py-3 rounded-md text-white bg-slblue-700 hover:bg-slblue-700 w-full dark:bg-sldarkblue-800 active dark:border',
    inactive:
        'inline-flex items-center px-4 py-3 rounded-md hover:text-gray-900 bg-white hover:bg-gray-100 w-full dark:border dark:border-sldarkblue-800 dark:hover:bg-slblue-700 dark:hover:text-white ring-1 ring-transparent hover:ring-white',
}

export const getYesCheckedStatus = (
    field: any,
    updatedFields: any,
    updatedLocalFields: any,
) => {
    if (field?.__typename && field.__typename === 'CustomisedComponentField') {
        const checked = updatedFields
            .filter((updatedField: any) => updatedField.fieldID === field.id)
            .map((updatedField: any) => {
                return updatedField.status
            })
        if (checked.length > 0) {
            return checked[0] === 'Off' ? false : true
        }
        return field.status === 'Off' ? false : true
    } else {
        const checked = updatedLocalFields
            .filter(
                (updatedField: any) => updatedField.localID === field.localID,
            )
            .map((updatedField: any) => {
                return updatedField.status
            })
        if (checked.length > 0) {
            return checked[0] === 'Off' ? false : true
        }
    }
}

export const getNoCheckedStatus = (
    field: any,
    updatedFields: any,
    updatedLocalFields: any,
) => {
    if (field?.__typename && field.__typename === 'CustomisedComponentField') {
        const checked = updatedFields
            .filter((updatedField: any) => updatedField.fieldID === field.id)
            .map((updatedField: any) => {
                return updatedField.status
            })
        if (checked.length > 0) {
            return checked[0] === 'Off' ? true : false
        }
        return field.status === 'Off' ? true : false
    } else {
        const checked = updatedLocalFields
            .filter(
                (updatedField: any) => updatedField.localID === field.localID,
            )
            .map((updatedField: any) => {
                return updatedField.status
            })
        if (checked.length > 0) {
            return checked[0] === 'Off' ? false : true
        }
    }
}

export const getGroupFields = (
    group: any,
    getSlallFields: any,
    tab: any,
    logBookConfig: any,
) => {
    const logbookFields = getSlallFields
    const defaultConfig = logbookFields.map((component: any) => component)
    var groupFields: any = []
    // defaultConfig.forEach((defaultLogBookComponents: any) => {
    //     if (tab === defaultLogBookComponents.label) {
    //         defaultLogBookComponents.items.forEach((defaultField: any) => {
    //             if (defaultField.groupTo === group) {
    //                 var hasField = false
    //                 var customisedLogBookComponentID = 0;
    //                 logBookConfig.customisedLogBookComponents.nodes.forEach(
    //                     (customisedLogBookComponent: any) => {
    //                         customisedLogBookComponent.customisedComponentFields.nodes
    //                             .filter((customFields: any, index: number, self: any[]) =>
    //                                 self.findIndex((c: any) => c.fieldName === customFields.fieldName) === index
    //                             )
    //                             .forEach((customFields: any) => {
    //                                 if (customFields.fieldName === defaultField.value) {
    //                                     groupFields.push(customFields)
    //                                     hasField = true
    //                                 }
    //                             },
    //                             )
    //                         if (customisedLogBookComponent.componentClass === defaultLogBookComponents.componentClass) {
    //                             customisedLogBookComponentID = customisedLogBookComponent.id
    //                         }
    //                     },
    //                 )
    //                 if (!hasField) {
    //                     groupFields.push({ ...defaultField, customisedLogBookComponentID: customisedLogBookComponentID, localID: customisedLogBookComponentID + defaultField.value })
    //                     customisedLogBookComponentID = 0
    //                 }
    //             }
    //         })
    //     }
    // })
    defaultConfig.forEach((defaultLogBookComponents: any) => {
        if (tab === defaultLogBookComponents.label) {
            defaultLogBookComponents.items.forEach((defaultField: any) => {
                if (defaultField.groupTo === group) {
                    const customisedLogBookComponent =
                        logBookConfig.customisedLogBookComponents.nodes.find(
                            (component: any) =>
                                component.componentClass ===
                                defaultLogBookComponents.componentClass,
                        )
                    if (customisedLogBookComponent) {
                        const customFields =
                            customisedLogBookComponent.customisedComponentFields.nodes.find(
                                (field: any) =>
                                    field.fieldName === defaultField.value,
                            )
                        if (customFields) {
                            groupFields.push(customFields)
                        } else {
                            const customisedLogBookComponentID =
                                customisedLogBookComponent.id
                            groupFields.push({
                                ...defaultField,
                                customisedLogBookComponentID,
                                localID:
                                    customisedLogBookComponentID +
                                    defaultField.value,
                            })
                        }
                    }
                }
            })
        }
    })
    return groupFields.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
}

export const getCategory = (
    customFields: any,
    getSlallFields: any,
    tab: any,
) => {
    if (
        customFields?.__typename &&
        customFields.__typename === 'CustomisedComponentField'
    ) {
        const logbookFields = getSlallFields
        const defaultConfig = logbookFields.map((component: any) => component)
        var category: any = 'Other'
        defaultConfig.forEach((defaultLogBookComponents: any) => {
            if (tab === defaultLogBookComponents.label) {
                defaultLogBookComponents.items.forEach(
                    (defaultField: any, index: number) => {
                        if (customFields.fieldName === defaultField.value) {
                            category = defaultField?.fieldSet
                                ? defaultField.fieldSet
                                : 'Other'
                        }
                    },
                )
            }
        })
        return category
    } else {
        return customFields.fieldSet ? customFields.fieldSet : 'Other'
    }
}

export const getLevelThreeCategory = (
    customFields: any,
    getSlallFields: any,
    tab: any,
) => {
    if (
        customFields?.__typename &&
        customFields.__typename === 'CustomisedComponentField'
    ) {
        const logbookFields = getSlallFields
        const defaultConfig = logbookFields.map((component: any) => component)
        var category: any = false
        defaultConfig.forEach((defaultLogBookComponents: any) => {
            if (tab === defaultLogBookComponents.label) {
                defaultLogBookComponents.items.forEach(
                    (defaultField: any, index: number) => {
                        if (customFields.fieldName === defaultField.value) {
                            category = defaultField?.groupTo
                                ? defaultField.groupTo
                                : false
                        }
                    },
                )
            }
        })
        return category
    } else {
        return customFields.groupTo ? customFields.groupTo : false
    }
}

export const getFieldsNotInConfig = (
    currentComponent: any,
    getSlallFields: any,
    logBookConfig: any,
) => {
    const logbookFields = getSlallFields
    const config = logBookConfig.customisedLogBookComponents.nodes
        .filter((component: any) => component.id == currentComponent.id)
        .map((component: any) => component)
    const defaultConfig = logbookFields.map((component: any) => component)
    var fieldsNotInConfig: any = []
    // config.forEach((customisedLogBookComponents: any) => {
    //     defaultConfig.forEach((defaultLogBookComponents: any) => {
    //         if (customisedLogBookComponents.componentClass === defaultLogBookComponents.componentClass) {
    //             defaultLogBookComponents.items.forEach(
    //                 (defaultField: any) => {
    //                     var found = false
    //                     customisedLogBookComponents.customisedComponentFields.nodes
    //                         .filter((customFields: any, index: number, self: any[]) =>
    //                             self.findIndex((c: any) => c.fieldName === customFields.fieldName) === index
    //                         )
    //                         .forEach(
    //                             (customFields: any) => {
    //                                 if (customFields.fieldName === defaultField.value) {
    //                                     found = true
    //                                 }
    //                             },
    //                         )
    //                     if (!found) {
    //                         fieldsNotInConfig.push(defaultField)
    //                     }
    //                 },
    //             )
    //         }
    //     })
    // })
    config.forEach((customisedLogBookComponents: any) => {
        const defaultLogBookComponents = defaultConfig.find(
            (defaultComponent: any) =>
                defaultComponent.componentClass ===
                customisedLogBookComponents.componentClass,
        )
        if (defaultLogBookComponents) {
            defaultLogBookComponents.items.forEach((defaultField: any) => {
                const found =
                    customisedLogBookComponents.customisedComponentFields.nodes.some(
                        (customFields: any) =>
                            customFields.fieldName === defaultField.value,
                    )
                if (!found) {
                    fieldsNotInConfig.push(defaultField)
                }
            })
        }
    })
    return fieldsNotInConfig
}

export const subCategoryVisibilityCheck = (
    component: any,
    tab: any,
    dailyCheckCategory: any,
    levelThreeCategories: any,
    levelThreeCategory: any,
) => {
    if (tab === 'Daily Checks') {
        if (component.subFields == null) return
        if (component.subFields == '') {
            return
        }
        const isEnabled = levelThreeCategories.filter((category: any) => {if (category.label === levelThreeCategory) {return category}})
        if (isEnabled.status == 'Enabled' && dailyCheckCategory == 'Engine Checks') {
            return
        }
        if (
            component.subFields &&
            component.subFields.split('||').includes(dailyCheckCategory)
        ) {
            return
        }
        return 'opacity-60 pointer-events-none'
    }
}

export const isCategorised = (
    currentComponent: any,
    getSlallFields: any,
    logBookConfig: any,
) => {
    const logbookFields = getSlallFields
    const config = logBookConfig.customisedLogBookComponents.nodes
        .filter((component: any) => component.id == currentComponent.id)
        .map((component: any) => component)
    const defaultConfig = logbookFields.map((component: any) => component)
    var isCategorised = false
    config.forEach((customisedLogBookComponents: any) => {
        defaultConfig.forEach((defaultLogBookComponents: any) => {
            if (
                customisedLogBookComponents.componentClass ===
                defaultLogBookComponents.componentClass
            ) {
                if (defaultLogBookComponents?.subCategory) {
                    isCategorised = true
                }
            }
        })
    })
    return isCategorised
}

export const getComponentsNotInConfig = (
    getSlallFields: any,
    logBookConfig: any,
) => {
    const logbookFields = getSlallFields
    const config = logBookConfig.customisedLogBookComponents.nodes
    const defaultConfig = logbookFields.map((component: any) => component)
    var componentsNotInConfig: any = []
    defaultConfig.forEach((defaultLogBookComponents: any) => {
        var found = false
        config.forEach((customisedLogBookComponents: any) => {
            if (
                customisedLogBookComponents.componentClass ===
                defaultLogBookComponents.componentClass
            ) {
                found = true
            }
        })
        if (!found) {
            componentsNotInConfig.push(defaultLogBookComponents)
        }
    })
    return componentsNotInConfig
}

export const isFileField = (field: any, getSlallFields: any, tab: any) => {
    if (field?.__typename && field.__typename === 'CustomisedComponentField') {
        const logbookFields = getSlallFields
        const defaultConfig = logbookFields.map((component: any) => component)
        var isFileField = false
        defaultConfig.forEach((defaultLogBookComponents: any) => {
            if (tab === defaultLogBookComponents.label) {
                defaultLogBookComponents.items.forEach((defaultField: any) => {
                    if (field.fieldName === defaultField.value) {
                        if (defaultField.fieldType === 'files') {
                            isFileField = true
                        }
                    }
                })
            }
        })
        return isFileField
    } else {
        const logbookFields = getSlallFields
        const defaultConfig = logbookFields.map((component: any) => component)
        var isFileField = false
        defaultConfig.forEach((defaultLogBookComponents: any) => {
            if (tab === defaultLogBookComponents.label) {
                defaultLogBookComponents.items.forEach((defaultField: any) => {
                    if (field.value === defaultField.value) {
                        if (defaultField.fieldType === 'files') {
                            isFileField = true
                        }
                    }
                })
            }
        })
        return isFileField
    }
}

export const getFieldGroup = (field: any, getSlallFields: any, tab: any) => {
    if (field?.__typename && field.__typename === 'CustomisedComponentField') {
        const logbookFields = getSlallFields
        const defaultConfig = logbookFields.map((component: any) => component)
        var group = false
        defaultConfig.forEach((defaultLogBookComponents: any) => {
            if (tab === defaultLogBookComponents.label) {
                defaultLogBookComponents.items.forEach((defaultField: any) => {
                    if (field.fieldName === defaultField.value) {
                        group = defaultField?.groupTo
                            ? defaultField.groupTo
                            : false
                    }
                })
            }
        })
        return group
    } else {
        const logbookFields = getSlallFields
        const defaultConfig = logbookFields.map((component: any) => component)
        var group = false
        defaultConfig.forEach((defaultLogBookComponents: any) => {
            if (tab === defaultLogBookComponents.label) {
                defaultLogBookComponents.items.forEach((defaultField: any) => {
                    if (field.value === defaultField.value) {
                        group = defaultField?.groupTo
                            ? defaultField.groupTo
                            : false
                    }
                })
            }
        })
        return group
    }
}

export const getTabTitle = (tab: any, SLALL_LogBookFields: any) => {
    const logbookFields = SLALL_LogBookFields
    const defaultConfig = logbookFields.map((component: any) => component)
    var title = tab
    defaultConfig.forEach((defaultLogBookComponents: any) => {
        if (tab.componentClass === defaultLogBookComponents.componentClass) {
            title = defaultLogBookComponents?.title
                ? defaultLogBookComponents?.title
                : tab.title
        }
    })
    if (title === 'Daily Checks') {
        title = 'Pre-departure checks'
    }
    return title
}

export const getFieldName = (field: any, getSlallFields: any) => {
    if (field?.__typename && field.__typename === 'CustomisedComponentField') {
        const logbookFields = getSlallFields
        const defaultConfig = logbookFields.map((component: any) => component)
        var title = field.fieldName
        defaultConfig.forEach((defaultLogBookComponents: any) => {
            defaultLogBookComponents.items.forEach((defaultField: any) => {
                if (field.fieldName === defaultField.value) {
                    title = defaultField?.title
                        ? defaultField?.title
                        : field.fieldName
                }
            })
        })
        return title
    } else {
        return field?.title ? field.title : field.value
    }
}

export const isFieldInConfig = (
    fieldName: string,
    logBookConfig: any,
    tab: any,
) => {
    var found = false
    logBookConfig.customisedLogBookComponents?.nodes
        .filter((component: any) => component.title === tab)
        .map((component: any) => {
            component.customisedComponentFields.nodes
                .filter(
                    (customFields: any, index: number, self: any[]) =>
                        self.findIndex(
                            (c: any) => c.fieldName === customFields.fieldName,
                        ) === index,
                )
                .forEach((customFields: any) => {
                    if (customFields.fieldName === fieldName) {
                        found = true
                    }
                })
        })
    return found
}

export const filterFieldClasses = (
    field: any,
    getSlallFields: any,
    tab: any,
) => {
    const logbookFields = getSlallFields
    const defaultConfig = logbookFields.map((component: any) => component)
    var classes = ''
    if (field?.__typename && field.__typename === 'CustomisedComponentField') {
        defaultConfig.forEach((defaultLogBookComponents: any) => {
            if (tab === defaultLogBookComponents.label) {
                defaultLogBookComponents.items.forEach((defaultField: any) => {
                    if (field.fieldName === defaultField.value) {
                        classes += defaultField?.classes
                    }
                })
            }
        })
    } else {
        defaultConfig.forEach((defaultLogBookComponents: any) => {
            if (tab === defaultLogBookComponents.label) {
                defaultLogBookComponents.items.forEach((defaultField: any) => {
                    if (field.value === defaultField.value) {
                        classes += defaultField?.classes
                    }
                })
            }
        })
    }
    return classes
}

export const fieldTitleFilter = (field: any, getSlallFields: any, tab: any) => {
    const logbookFields = getSlallFields
    const defaultConfig = logbookFields.map((component: any) => component)
    var title = field.customisedFieldTitle
    if (field.__typename && field.__typename === 'CustomisedComponentField') {
        defaultConfig.forEach((defaultLogBookComponents: any) => {
            if (tab === defaultLogBookComponents.label) {
                defaultLogBookComponents.items.forEach((defaultField: any) => {
                    if (field.fieldName === defaultField.value) {
                        title = defaultField?.forcedTitle
                            ? defaultField?.title
                            : field.customisedFieldTitle
                    }
                })
            }
        })
    }
    return title
}

export const isInLevel = (
    component: any,
    level: number,
    getSlallFields: any,
) => {
    const logbookFields = getSlallFields
    return (
        logbookFields
            .filter((field: any) => field.subCategory)[0]
            .items.filter(
                (field: any) =>
                    field.level === 3 && field.fieldSet === component,
            ).length > 0
    )
}

export const getLevelThreeCategoryGroup = (
    customFields: any,
    getSlallFields: any,
    tab: any,
) => {
    if (
        customFields?.__typename &&
        customFields.__typename === 'CustomisedComponentField'
    ) {
        const logbookFields = getSlallFields
        const defaultConfig = logbookFields.map((component: any) => component)
        var category: any = false
        defaultConfig.forEach((defaultLogBookComponents: any) => {
            if (tab === defaultLogBookComponents.label) {
                defaultLogBookComponents.items.forEach(
                    (defaultField: any, index: number) => {
                        if (customFields.fieldName === defaultField.value) {
                            category = defaultField.tab
                        }
                    },
                )
            }
        })
        return category
    } else {
        return customFields.tab ? customFields.tab : false
    }
}

export const fieldIsGroup = (field: any, getSlallFields: any, tab: any) => {
    const logbookFields = getSlallFields
    const defaultConfig = logbookFields.map((component: any) => component)
    var isGroup = false
    defaultConfig.forEach((defaultLogBookComponents: any) => {
        if (tab === defaultLogBookComponents.label) {
            defaultLogBookComponents.items.forEach((defaultField: any) => {
                if (field.fieldName === defaultField?.groupTo) {
                    isGroup = true
                }
            })
        }
    })
    return isGroup
}
