"use client"

import { DetectorCard } from "@/components/DetectorCard";
import { EditDetectorOverlay } from "@/components/EditDetectorOverlay";
// import Image from "next/image";
// import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [apiKey, setApiKey] = useState<string>("");
  const [apiKeyTemp, setApiKeyTemp] = useState<string>("");
  const [detectors, setDetectors] = useState<DetType[]>([]);
  const [availableDetectors, setAvailableDetectors] = useState<DetBaseType[]>([]);
  const [showEditOverlay, setShowEditOverlay] = useState<boolean>(false);
  const [editOverlayIndex, setEditOverlayIndex] = useState<number>(0);

  useEffect(() => {
    // fetch detector configs
    fetch("/api/config").then((res) => res.json()).then((data) => {
      setApiKeyTemp((data.api_key as string).substring(0, 15) + "...");
      setApiKey(data.api_key as string);
      setDetectors(data.detectors as DetType[]);
    });

    // fetch available detectors
    fetch("/api/detectors").then((res) => res.json()).then((data) => {
      setAvailableDetectors(data as DetBaseType[]);
    });
  }, []);


  const saveDetectors = (detectors_to_save: DetType[]) => {
    // save detector configs
    fetch("/api/config/detectors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        detectors: detectors_to_save,
      }),
    });
  };


  const saveApiKey = (apiKey: string) => {
    // save api key
    fetch("/api/config/api_key", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
      }),
    });
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24 gap-2">
      <h1 className="text-4xl font-bold">Detector Configs</h1>
      <div className="flex gap-2">
        <input className="border-2 border-gray-300 rounded-md p-2" type="text" placeholder="API Key" value={apiKeyTemp} onChange={(e) => setApiKeyTemp(e.target.value)} />
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => {
          setApiKey(apiKeyTemp);
          saveApiKey(apiKeyTemp);
        }}>
          Save
        </button>
      </div>
      <div className="flex flex-col items-center gap-2">
        {detectors.map((detector, index) => (
          <div className="flex flex-col items-center" key={index}>
            <DetectorCard detector={detector} index={index} onclick={() => {
              setEditOverlayIndex(index);
              setShowEditOverlay(true);
            }} />
          </div>
        ))}
      </div>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => {
        setShowEditOverlay(true);
        setEditOverlayIndex(detectors.length);
        let detectors_copy = [...detectors, {
          name: "New Detector",
          query: "New Query?",
          id: "",
          config: {
            vid_src: -1,
            trigger_type: "time",
            cycle_time: 30,
          }
        }];
        setDetectors(detectors_copy);
      }}>
        Add Detector
      </button>
      { detectors.length > 0 && showEditOverlay &&
        <EditDetectorOverlay detector={detectors[editOverlayIndex]} detectors={availableDetectors} index={0} onSave={(e) => {
          setShowEditOverlay(false);
          let detectors_copy = [...detectors];
          detectors_copy[editOverlayIndex] = e.detector;
          setDetectors(detectors_copy);
          saveDetectors(detectors_copy);
        }} onDelete={() => {
          setShowEditOverlay(false);
          let detectors_copy = [...detectors];
          detectors_copy.splice(editOverlayIndex, 1);
          setDetectors(detectors_copy);
          saveDetectors(detectors_copy);
        }} />
      }
    </main>
  );
}