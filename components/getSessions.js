import React, { useEffect, useState } from 'react';
import axios from 'axios';

const GetSessions = ({ year, sessionType, onSessionSelect }) => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const response = await axios.get('https://api.openf1.org/v1/sessions', {
                    params: {
                        year,
                        session_type: sessionType
                    }
                });
                setSessions(response.data);
                console.log('Sessions fetched:', response.data); // Debugging
                setLoading(false);
                if (response.data.length > 0) {
                    onSessionSelect(response.data[0].session_key); // Set default session key
                }
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };

        if (year && sessionType) {
            fetchSessions();
        }
    }, [year, sessionType]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div className="mb-4 flex items-center">
            <label htmlFor="sessions" className="mr-2 font-semibold text-gray-700">Select Session: </label>
            <select id="sessions" onChange={e => onSessionSelect(e.target.value)} className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {sessions.map(session => (
                    <option key={session.session_key} value={session.session_key}>
                        {session.country_name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default GetSessions;
