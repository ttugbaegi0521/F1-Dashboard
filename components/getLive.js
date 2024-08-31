"use client";

import React, { useState, useEffect } from 'react';
import { inflate } from 'fflate';
import TrackMap from './trackMap';

function decodeData(encodedStr) {
    return new Promise((resolve, reject) => {
        try {
            // Base64 decode
            const decodedBase64 = atob(encodedStr);
            const binaryData = new Uint8Array(decodedBase64.length);
            for (let i = 0; i < decodedBase64.length; i++) {
                binaryData[i] = decodedBase64.charCodeAt(i);
            }

            // Decompress using fflate
            inflate(binaryData, (err, decompressedData) => {
                if (err) {
                    console.error('Decompression error:', err);
                    reject(err);
                } else {
                    const decompressedStr = new TextDecoder().decode(decompressedData);
                    // console.log('Decompressed data:', decompressedStr);
                    resolve(decompressedStr); // Resolve the decompressed data
                }
            });
        } catch (err) {
            console.error('Decompression or parsing error:', err);
            reject(err);
        }
    });
}


async function connectwss(token, setLiveData) {
    const hub = encodeURIComponent(JSON.stringify([{ name: "Streaming" }]));
    const encodedToken = encodeURIComponent(token);
    const url = `wss://livetiming.formula1.com/signalr/connect?clientProtocol=1.5&transport=webSockets&connectionToken=${encodedToken}&connectionData=${hub}`;

    const p = new Promise((res, rej) => {
        const sock = new WebSocket(url);

        sock.onopen = () => {
            res(sock);
            setTimeout(() => {
                sock.close();
            }, 1000);
        };

        sock.onmessage = async (event) => {
            try {
                const data = JSON.parse(event.data);
                // console.log('Received Data:', data);

                // Handle CarData.z
                if (data.R && data.R["CarData.z"]) {
                    // console.log('CarData.z:', data.R["CarData.z"]);
                    try {
                        const decodedCarData = await decodeData(data.R["CarData.z"]);
                        // console.log('Decoded CarData:', decodedCarData);
                        data.R.CarData_decoded = decodedCarData;
                    } catch (decodeErr) {
                        console.error('Error decoding CarData.z:', decodeErr);
                    }
                }

                // Handle Position.z
                if (data.R && data.R["Position.z"]) {
                    // console.log('Position.z:', data.R["Position.z"]);
                    try {
                        const decodedPositionData = await decodeData(data.R["Position.z"]);
                        data.R.Position_decoded = decodedPositionData;
                        // console.log('Decoded Position Data:', decodedPositionData);
                    } catch (decodeErr) {
                        console.error('Error decoding Position.z:', decodeErr);
                    }
                }

                setLiveData((prevData) => [...prevData, data]);
            } catch (err) {
                console.error('Error handling WebSocket message:', err);
            }
        };

        sock.onerror = (error) => {
            console.error('WebSocket error:', error);
            rej(error);
        };

        sock.onclose = (event) => {
            console.log("WebSocket connection closed", event);
        };
    });

    return p;
}

async function fetchLiveData(setLiveData) {
    try {
        const response = await fetch("/api/signalr/negotiate?connectionData=%5B%7B%22name%22%3A%22Streaming%22%7D%5D&clientProtocol=1.5");
        const data = await response.json();

        const sock = await connectwss(data.ConnectionToken, setLiveData);

        sock.send(JSON.stringify({
            "H": "Streaming",
            "M": "Subscribe",
            "A": [["TimingData", "CarData.z", "Position.z"]],
            "I": 1,
        }));
    } catch (e) {
        console.error(e);
    }
}

export default function GetLive() {
    const [liveData, setLiveData] = useState([]);
    const [carPositions, setCarPositions] = useState([]);

    useEffect(() => {
        fetchLiveData(setLiveData);
    }, []);

    useEffect(() => {
        // Extract car positions from the decoded data
        if (liveData.length > 0) {
            const latestData = liveData[liveData.length - 1];
            console.log('Latest Data:', latestData);
            if (latestData.R && latestData.R.Position_decoded) {
                console.log('Position Data:', latestData.R.Position_decoded.Position);
                // const parseData = JSON.parse(latestData.R.Position_decoded.Position);
                // const positions = parseData[parseData.length - 1].Entries;
                // const timeStamps = parseData[parseData.length - 1].Timestamp;

                // const carData = positions.map((p, i) => {
                //     console.log('Car Data:', p + ' ' + timeStamps[i]);
                //     const [x, y] = p;
                //     return { x, y, time: timeStamps[i] };
                // });
            }
        }
    }, [liveData]);

    return (
        <div style={{ color: 'white' }}>
            <h1>Live Data</h1>
            <TrackMap carPositions={carPositions} />
            <div style={{ overflow: 'auto', height: '500px', width: "70%" }}>
                <pre>{JSON.stringify(liveData, null, 2)}</pre>
            </div>

            {
                JSON.stringify(liveData)
            }
        </div>
    );
}
