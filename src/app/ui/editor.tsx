import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'

const QuillEditor = dynamic(() => import('react-quill'), { ssr: false })

export default function Editor(props: any) {
    // const [content, setContent] = useState(props.content);

    const quillModules = {
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'image'],
            [{ align: [] }, { color: [] }],
            ['clean'],
        ],
    }

    const quillFormats = [
        'header',
        'bold',
        'italic',
        'underline',
        'strike',
        'blockquote',
        'list',
        'bullet',
        'link',
        'image',
        'align',
        'color',
        'code-block',
    ]

    // const handleEditorChange = (newContent: any) => {
    //     setContent(newContent);
    // };

    return (
        <div
            className={`${props.className} flex items-center flex-col dark:bg-white mb-2 rounded-lg w-full md:w-auto`}>
            <div className="h-[17.7rem] w-full">
                <QuillEditor
                    value={props.content}
                    placeholder={props.placeholder}
                    onChange={props.handleEditorChange}
                    onBlur={props.handleEditorBlur}
                    modules={quillModules}
                    formats={quillFormats}
                    className="w-full h-60 mb-2 bg-transparent rounded-lg !text-base !font-inter font-normal"
                />
            </div>
        </div>
    )
}
