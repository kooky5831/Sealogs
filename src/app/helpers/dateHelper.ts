import dayjs from 'dayjs'
import { isEmpty, trim } from 'lodash'

export const formatDate = (dateString: any = '', twoDigitYear = true) => {
    if (isEmpty(trim(dateString))) {
        return ''
    }
    const date =
        dateString && typeof dateString === 'object'
            ? new Date(dayjs(dateString.toString()).format('YYYY-MM-DD'))
            : new Date(dateString)
    const options = {
        year: twoDigitYear ? '2-digit' : 'numeric',
        month: 'numeric',
        day: 'numeric',
    } as const
    
    const formattedDate = date.toLocaleDateString(undefined, options)
    return formattedDate
}

export const formatDateTime = (dateString: any = '', twoDigitYear = true) => {
    if (isEmpty(trim(dateString))) {
        return ''
    }
    const date =
        typeof dateString === 'object'
            ? new Date(dayjs(dateString).format('YYYY-MM-DD HH:mm:ss'))
            : new Date(dateString)
    const options = {
        year: twoDigitYear ? '2-digit' : 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
    } as const
    const formattedDate = date.toLocaleDateString(undefined, options)
    return formattedDate
}

export const formatDBDateTime = (dateString: any = '') => {
    if (isEmpty(trim(dateString))) {
        return ''
    }
    return dayjs(dateString).format('YYYY-MM-DD HH:mm:ss')
}
