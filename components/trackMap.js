'use client';

import { useEffect, useState } from "react";
import { fetchTrackCorners } from "./fetchMap";

const space = 1000;

const rad = (deg) => deg * (Math.PI / 180);

const rotate = (x, y, a, px, py) => {
    const c = Math.cos(rad(a));
    const s = Math.sin(rad(a));

    x -= px;
    y -= py;

    const newX = x * c - y * s;
    const newY = y * c + x * s;

    return { x: newX + px, y: newY + py };
};

const createSectors = (map) => {
    const sectors = [];
    const points = map.x.map((x, index) => ({ x, y: map.y[index] }));

    for (let i = 0; i < map.marshalSectors.length; i++) {
        sectors.push({
            number: i + 1,
            start: map.marshalSectors[i].trackPosition,
            end: map.marshalSectors[i + 1] ? map.marshalSectors[i + 1].trackPosition : map.marshalSectors[0].trackPosition,
            points: [],
        });
    }

    let dividers = sectors.map((s) => findMinDistance(s.start, points));
    for (let i = 0; i < dividers.length; i++) {
        let start = dividers[i];
        let end = dividers[i + 1] ? dividers[i + 1] : dividers[0];
        if (start < end) {
            sectors[i].points = points.slice(start, end + 1);
        } else {
            sectors[i].points = points.slice(start).concat(points.slice(0, end + 1));
        }
    }

    return sectors;
};

const calculateDistance = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

const findMinDistance = (point, points) => {
    let min = Infinity;
    let minIndex = -1;
    for (let i = 0; i < points.length; i++) {
        const distance = calculateDistance(point.x, point.y, points[i].x, points[i].y);
        if (distance < min) {
            min = distance;
            minIndex = i;
        }
    }
    return minIndex;
};

export default function Map({ carPositions }) {
    const [points, setPoints] = useState(null);
    const [bounds, setBounds] = useState([null, null, null, null]);
    const [mapRotation, setMapRotation] = useState(0);
    const [centerX, setCenterX] = useState(0);
    const [centerY, setCenterY] = useState(0);

    useEffect(() => {
        //update car positions when new data is received
        if (!carPositions) return;


        const fetchAndProcessMap = async () => {
            const mapJson = await fetchTrackCorners();
            console.log('Fetched Map Data:', mapJson); // Debugging

            if (!mapJson || !mapJson.x || !mapJson.y) {
                console.error('Invalid map data');
                return;
            }

            const minX = Math.min(...mapJson.x);
            const minY = Math.min(...mapJson.y);
            const maxX = Math.max(...mapJson.x);
            const maxY = Math.max(...mapJson.y);

            const centerX = (maxX + minX) / 2;
            const centerY = (maxY + minY) / 2;
            const fixedRotation = mapJson.rotation;

            setMapRotation(fixedRotation);
            setCenterX(centerX);
            setCenterY(centerY);

            const sectors = createSectors(mapJson).map((s) => {
                const start = rotate(s.start.x, s.start.y, fixedRotation, centerX, centerY);
                const end = rotate(s.end.x, s.end.y, fixedRotation, centerX, centerY);
                const points = s.points.map((p) => rotate(p.x, p.y, fixedRotation, centerX, centerY));
                return {
                    ...s,
                    start,
                    end,
                    points,
                };
            });

            const rotatedPoints = mapJson.x.map((x, index) => rotate(x, -mapJson.y[index], fixedRotation + 180, centerX, centerY));

            const pointsX = rotatedPoints.map((item) => item.x);
            const pointsY = rotatedPoints.map((item) => item.y);

            const cMinX = Math.min(...pointsX) - space;
            const cMinY = Math.min(...pointsY) - space;
            const cWidthX = Math.max(...pointsX) - cMinX + space * 2;
            const cWidthY = Math.max(...pointsY) - cMinY + space * 2;

            setBounds([cMinX, cMinY, cWidthX, cWidthY]);
            setPoints(rotatedPoints);
        };

        fetchAndProcessMap();
    }, [carPositions]);

    if (!points || bounds.some((b) => b === null)) {
        return (
            <div className="h-full w-full p-2" style={{ minHeight: "35rem" }}>
                <div className="h-full w-full animate-pulse rounded-lg bg-zinc-800" />
            </div>
        );
    }

    return (
        <svg
            viewBox={`${bounds[0]} ${bounds[1]} ${bounds[2]} ${bounds[3]}`}
            className="h-full w-full xl:max-h-screen"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                className="stroke-gray-800"
                strokeWidth={300} // Adjusted strokeWidth
                strokeLinejoin="round"
                fill="transparent"
                d={`M${points[0].x},${points[0].y} ${points.map((point) => `L${point.x},${point.y}`).join(" ")}`}
            />

            {/* Render Car Positions */}
            {carPositions && Object.keys(carPositions).map((key) => {
                const pos = carPositions[key] || { X: 0, Y: 0 };
                console.log(`Car ${key} Position:`, pos); // Debugging
                const rotatedPos = rotate(pos.X, pos.Y, -mapRotation + 180, centerX, centerY);
                return (
                    <circle
                        key={`car-${key}`}
                        cx={rotatedPos.x}
                        cy={rotatedPos.y}
                        r={10} // size of car dots
                        fill="red" // color of car dots
                    />
                );
            })}
        </svg>
    );
}
