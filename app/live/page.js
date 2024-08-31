import GetLive from "@/components/getLive";

export default function Live() {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            {/* getLive */}

            <h1 className="text-4xl font-bold">Live Data</h1>
            <GetLive />
        </div>
    );
}


