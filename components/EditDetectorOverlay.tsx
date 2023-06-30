import { useState } from "react";
import { Dropdown } from "./Dropdown";

export const EditDetectorOverlay = ({ detector, detectors, index, onSave, onDelete }:
    { detector: DetType, detectors: DetBaseType[], index: number, onSave: (e: any) => void, onDelete: (e: any) => void }
) => {
    const [name, setName] = useState<string>(detector.name);
    const [query, setQuery] = useState<string>(detector.query);
    const [id, setId] = useState<string>(detector.id);
    const [vidSrc, setVidSrc] = useState<number>(detector.config.vid_src);
    const [triggerType, setTriggerType] = useState<string>(detector.config.trigger_type);
    const [cycleTime, setCycleTime] = useState<number | undefined>(detector.config.cycle_time);
    const [pin, setPin] = useState<number | undefined>(detector.config.pin);
    const [pinActiveState, setPinActiveState] = useState<number | undefined>(detector.config.pin_active_state);

    return (
        <div className="flex flex-col items-center shadow-md bg-white rounded-md p-5 relative">
            <div className="flex flex-col gap-2">

                <div className="flex gap-2">
                    <div className="font-bold  place-self-center">Name:</div>
                    {/* <input className="border-2 border-gray-300 rounded-md p-2  w-full" type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} /> */}
                    <Dropdown options={detectors.map((detector) => detector.name)} selected={name} setSelected={(e, idx) => {
                        setName(e);
                        setQuery(detectors[idx].query);
                        setId(detectors[idx].id);
                    }} />
                </div>
                <div className="flex gap-2">
                    <div className="font-bold  place-self-center">Query:</div>
                    {/* <input className="border-2 border-gray-300 rounded-md p-2  w-full" type="text" placeholder="Query" value={query} onChange={(e) => setQuery(e.target.value)} /> */}
                    <input className="border-2 border-gray-300 rounded-md p-2  w-full" type="text" placeholder="Query" value={query} onChange={(e) => {}} />
                </div>
                <div className="flex gap-2">
                    <div className="font-bold  place-self-center">Video Source #:</div>
                    <input className="border-2 border-gray-300 rounded-md p-2  w-full" type="number" placeholder="Video Source #" value={vidSrc} onChange={(e) => setVidSrc(parseInt(e.target.value))} min={-1} />
                </div>
                <div className="flex gap-2">
                    <div className="font-bold  place-self-center">Trigger Type:</div>
                    <Dropdown options={["time", "pin", "motion"]} selected={triggerType} setSelected={(e, idx) => setTriggerType(e)} />
                </div>
                {
                    triggerType === "time" &&
                    <div className="flex gap-2">
                        <div className="font-bold  place-self-center">Cycle Time:</div>
                        <input className="border-2 border-gray-300 rounded-md p-2  w-full" type="number" placeholder="Cycle Time" value={cycleTime} onChange={(e) => setCycleTime(parseInt(e.target.value))} min={0} />
                    </div>
                }
                {
                    triggerType === "pin" &&
                    <div>
                        <div className="flex gap-2">
                            <div className="font-bold  place-self-center">Pin:</div>
                            <input className="border-2 border-gray-300 rounded-md p-2  w-full" type="number" placeholder="Pin" value={pin} onChange={(e) => setPin(parseInt(e.target.value))} min={0} />
                        </div>
                        <div className="flex gap-2">
                            <div className="font-bold  place-self-center">Pin Active State:</div>
                            <Dropdown options={["LOW", "HIGH"]} selected={pinActiveState === 0 ? "LOW" : "HIGH"} setSelected={(e, idx) => setPinActiveState(e === "LOW" ? 0 : 1)} />
                        </div>
                    </div>
                }
            </div>
            <div className="p-10"></div>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded absolute bottom-2 right-2" onClick={() => {
                if (id === "") return;
                onSave({
                detector: {
                    name,
                    query,
                    id,
                    config: {
                        vid_src: vidSrc,
                        trigger_type: triggerType,
                        cycle_time: cycleTime,
                        pin,
                        pin_active_state: pinActiveState,
                    }
                },
                index
                })
            }}>
                Save
            </button>
            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded absolute bottom-2 left-2" onClick={() => onDelete({
                index
            })}>
                Delete
            </button>
        </div>
    );
}