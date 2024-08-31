'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GetSessions from "@/components/getSessions";

export default function Home() {
  const [year, setYear] = useState("2024");
  const [sessionType, setSessionType] = useState("Race");
  const [view, setView] = useState("Past");
  const [sessionKey, setSessionKey] = useState("");
  const router = useRouter();

  useEffect(() => {
    const canvas = document.getElementById('noise');
    const ctx = canvas.getContext('2d');

    canvas.width = 1920;
    canvas.height = 1080;

    canvas.style.transform = 'scale(1.75)';


    function drawNoise() {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const color = Math.random() * 255;
        data[i] = color;
        data[i + 1] = color;
        data[i + 2] = color;
        data[i + 3] = 255;
      }
      ctx.putImageData(imageData, 0, 0);
    }

    function loop() {
      drawNoise();
      setTimeout(loop, 500); // Adjust the time (ms) to reduce the frame rate
    }

    loop();

    setTimeout(() => {
      canvas.classList.add('noise-animate');
    }, 0);
  }, []);

  const handleYearChange = (event) => {
    setYear(event.target.value);
  };

  const handleSessionTypeChange = (event) => {
    setSessionType(event.target.value);
  };

  const handleSessionKeyChange = (value) => {
    setSessionKey(value);
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const handleGoClick = (e) => {
    e.preventDefault();
    if (view === "Live") {
      router.push('/live');
    } else {
      router.push(`/past?year=${year}&session=${sessionType}&session_key=${sessionKey}`);
    }
  };

  return (
    <div>
      <canvas id="noise" className="noise noise-animate" width="1440" height="779"></canvas>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-md rounded-lg p-6 flex flex-col items-center">
          <div className={`mb-4 flex items-center rounded-lg p-2 border-4 ${view === "Past" ? "border-yellow-500" : "border-red-500"}`}>
            <button
              onClick={() => handleViewChange("Past")}
              className={`mr-4 p-2 rounded ${view === "Past" ? "font-bold" : ""}`}
            >
              Past
            </button>
            <span className="text-black">/</span>
            <button
              onClick={() => handleViewChange("Live")}
              className={`ml-4 p-2 rounded ${view === "Live" ? "font-bold" : ""}`}
            >
              Live
            </button>
          </div>
          {view === "Past" && (
            <div className="flex flex-col items-center mb-4">
              <div className="mb-4 flex items-center">
                <label htmlFor="year" className="mr-2 font-semibold text-gray-700">Select Year: </label>
                <select id="year" value={year} onChange={handleYearChange} className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="2022">2022</option>
                  <option value="2023">2023</option>
                  <option value="2024">2024</option>
                </select>
              </div>
              <div className="mb-4 flex items-center">
                <label htmlFor="sessionType" className="mr-2 font-semibold text-gray-700">Select Session Type: </label>
                <select id="sessionType" value={sessionType} onChange={handleSessionTypeChange} className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="Practice">Practice</option>
                  <option value="Qualifying">Qualifying</option>
                  <option value="Race">Race</option>
                </select>
              </div>
              <GetSessions year={year} sessionType={sessionType} onSessionSelect={handleSessionKeyChange} />
            </div>
          )}
          <button onClick={handleGoClick} className="mt-4 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700">
            {view === "Live" ? "Go see the live session" : `Go see the past ${sessionType} session of ${year}`}
          </button>
        </div>
        {view === "Past" && (
          <p className="mt-8 bg-white shadow-md rounded-lg p-4 text-gray-700 font-medium text-center w-[45rem]">
            Selected Year: {year} | Selected Session Type: {sessionType} | Selected Session Key: {sessionKey}
          </p>
        )}
      </main>

    </div>
  );
}
