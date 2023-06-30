import multiprocessing
from fastapi import FastAPI
import json
import groundlight
import pydantic
from api.gl_process import Detector as GLDetector
from api.gl_process import run_process

class Config(pydantic.BaseModel):
    vid_src: int
    trigger_type: str
    cycle_time: int | None
    pin: int | None
    pin_active_state: int | None

class Detector(pydantic.BaseModel):
    name: str
    id: str
    query: str
    config: Config

class DetectorList(pydantic.BaseModel):
    detectors: list[Detector]

print("Loading config...")
with open("./api/gl_config.json", "r") as f:
    config = json.load(f)
detectors = config["detectors"] if "detectors" in config else []
print(detectors)
DETECTOR_PROCESSES = [multiprocessing.Process(target=run_process, args=(
    GLDetector(d["id"], d["config"]["vid_src"], d["config"]["trigger_type"], d["config"]["cycle_time"], d["config"]["pin"], d["config"]["pin_active_state"]),
)) for d in detectors]
for p in DETECTOR_PROCESSES:
    p.start()

app = FastAPI()

@app.get("/api/config")
def get_config():
    with open("./api/gl_config.json", "r") as f:
        return json.load(f)
    
@app.get("/api/detectors")
def get_detectors():
    with open("./api/gl_config.json", "r") as f:
            config = json.load(f)
    api_key = config["api_key"] if "api_key" in config else None
    endpoint = config["endpoint"] if "endpoint" in config else None
    # TODO: use this as default gl
    gl = groundlight.Groundlight(api_token=api_key, endpoint=endpoint)
    try:
        return [json.loads(d.json()) for d in gl.list_detectors().results]
    except:
        return []

@app.post("/api/config/detectors")
async def post_detectors(detectors: DetectorList):
    with open("./api/gl_config.json", "r") as f:
        config = json.load(f)
    config["detectors"] = json.loads(detectors.json())["detectors"]

    # stop all processes
    # for p in DETECTOR_PROCESSES:
    #     p.terminate()
    
    # # start new processes
    # # TODO: pass in default gl
    # DETECTOR_PROCESSES = [multiprocessing.Process(target=run_process, args=(
    #     GLDetector(d["id"], d["config"]["vid_src"], d["config"]["trigger_type"], d["config"]["cycle_time"], d["config"]["pin"], d["config"]["pin_active_state"]),
    # )) for d in config["detectors"]]
    # for p in DETECTOR_PROCESSES:
    #     p.start()

    # save config
    with open("./api/gl_config.json", "w") as f:
        json.dump(config, f, indent=4)
    return config

class ApiKey(pydantic.BaseModel):
    api_key: str

@app.post("/api/config/api_key")
def post_api_key(key: ApiKey):
    with open("./api/gl_config.json", "r") as f:
        config = json.load(f)
    config["api_key"] = key.api_key
    with open("./api/gl_config.json", "w") as f:
        json.dump(config, f, indent=4)
    return config

# def __del__():
#     print("Stopping processes...")
#     [p.terminate() for p in DETECTOR_PROCESSES]

"""
{
    "api_key": "api_keyKEYkeyKEYkeyKEYkeyKEYkeyKEYkey",
    "detectors": [
        {
            "id": "det_1",
            "name": "Detector 1",
            "query": "Is there a car in the driveway?",
            "config": {
                "vid_src": 0,
                "trigger_type": "time",
                "cycle_time": 60
            }
        },
        {
            "id": "det_2",
            "name": "Detector 2",
            "query": "Is there a person in the image?",
            "config": {
                "vid_src": 1,
                "trigger_type": "time",
                "cycle_time": 30
            }
        }
    ]
}
"""