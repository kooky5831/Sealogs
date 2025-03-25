import { useEffect, useState } from 'react'

const SelectClientDropdown = ({ value, onChange }: any) => {
    const [clients, setClients] = useState([])

    useEffect(() => {
        const json = JSON.parse(
            localStorage.getItem('availableClients') || '[]',
        )
        const clientList = json.map((client: any) => {
            return {
                label: client.Title,
                value: client.ID,
            }
        })
        setClients(clientList)
    }, [])
    return (
        <select
            defaultValue={value}
            onChange={onChange}
            className="border border-gray-300 rounded-md py-2 px-4 pr-8  focus:outline-none ">
            <option value={0} className="text-gray-500">
                Select a client
            </option>
            {clients.map((client: any) => (
                <option key={client.value} value={client.value}>
                    {client.label}
                </option>
            ))}
        </select>
    )
}

export default SelectClientDropdown
