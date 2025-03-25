import { getLogBookEntries } from '@/app/lib/actions'
import { UPDATE_SECTION_MEMBER_COMMENT } from '@/app/lib/graphQL/mutation'
import { GET_SECTION_MEMBER_COMMENTS } from '@/app/lib/graphQL/query'
import { useLazyQuery, useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'

const OpenPreviousLogbookComments = ({
    prevComments = false,
    onDismiss,
    onDismissAll,
    onRelevantQuestionChange,
    enableDismissAll = true,
    enableRelevantQuestion = false,
}: {
    prevComments: any
    onDismiss: any
    onDismissAll: any
    onRelevantQuestionChange?: any
    enableDismissAll?: boolean
    enableRelevantQuestion?: boolean
}) => {
    const [comments, setComments] = useState([])
    const [relevantComments, setRelevantComments] = useState([] as any)
    const [
        updateSectionMemberComment,
        { loading: updateSectionMemberCommentLoading },
    ] = useMutation(UPDATE_SECTION_MEMBER_COMMENT, {
        onCompleted: (response: any) => {},
        onError: (error: any) => {
            console.error('Section member comment update error', error)
        },
    })
    const handleDismissComment = async (comment: any) => {
        await updateSectionMemberComment({
            variables: {
                input: {
                    id: comment.id,
                    hideComment: true,
                },
            },
        })
        // remove from prevComments
        const c = comments.filter((c: any) => c.id !== comment.id)
        setComments(c)
        onDismiss(c)
    }
    const handleDismissAllComment = async () => {
        const promises = comments.map(async (comment: any) => {
            await updateSectionMemberComment({
                variables: {
                    input: {
                        id: comment.id,
                        hideComment: true,
                    },
                },
            })
        })
        await Promise.all(promises)
        setComments([])
        onDismissAll()
    }
    const handleRadioChange = async (commentId: string, value: string) => {
        const newRC = relevantComments.map((c: any) => {
            if (c.id === commentId) {
                c.value = value
            }
            return c
        })
        setRelevantComments(newRC)
        onRelevantQuestionChange(newRC)
    }
    useEffect(() => {
        if (prevComments) {
            setComments(prevComments)
            const rc = prevComments.map((c: any) => ({
                id: c.id,
                value: 'yes',
            }))
            setRelevantComments(rc)
        }
    }, [prevComments])
    return (
        <>
            {comments.map((comment: any) => (
                <div key={comment.id}>
                    <div className="flex justify-between items-center text-sm text-slorange-1000 bg-slorange-300 border px-4 py-2 border-transparent rounded-md shadow-sm ring-1 ring-inset ring-slorange-1000">
                        <div>{comment.comment}</div>
                        <div>
                            <button
                                onClick={() => handleDismissComment(comment)}>
                                x
                            </button>
                        </div>
                    </div>
                    {enableRelevantQuestion && (
                        <div className="flex items-center justify-between my-2">
                            <div>Is this comment still relevant?</div>
                            <div className="flex gap-4">
                                <label>
                                    <input
                                        name={`relevant-${comment.id}`}
                                        type="radio"
                                        value="yes"
                                        defaultChecked={
                                            relevantComments.find(
                                                (c: any) => c.id === comment.id,
                                            )?.value === 'yes'
                                        }
                                        onChange={() =>
                                            handleRadioChange(comment.id, 'yes')
                                        }
                                    />{' '}
                                    Yes
                                </label>
                                <label>
                                    <input
                                        name={`relevant-${comment.id}`}
                                        type="radio"
                                        value="no"
                                        defaultChecked={
                                            relevantComments.find(
                                                (c: any) => c.id === comment.id,
                                            )?.value === 'no'
                                        }
                                        onChange={() =>
                                            handleRadioChange(comment.id, 'no')
                                        }
                                    />{' '}
                                    No
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {enableDismissAll && comments.length > 0 && (
                <div className="flex justify-end my-1">
                    <div className="text-sm text-slorange-1000 bg-slorange-300 border px-4 py-2 border-transparent rounded-md shadow-sm ring-1 ring-inset ring-slorange-1000">
                        <button
                            onClick={() => handleDismissAllComment()}
                            disabled={updateSectionMemberCommentLoading}>
                            {updateSectionMemberCommentLoading
                                ? 'Dismissing Comments...'
                                : 'Dismiss All'}
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}

export default OpenPreviousLogbookComments
