import time
import schedule
import requests
from PIL import Image
from io import BytesIO
import imageio
import numpy as np


def getthumb(url, frame_time):
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        try:
            with Image.open(response.raw) as img:
                img.seek(frame_time)  # Move to the specific frame
                return img
        except Exception as e:
            print(f"Error fetching frame: {e}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"Error fetching stream: {e}")
        return None


def genThumbnailPng():
    try:
        url = "http://localhost:4000/api/streams"
        r = requests.get(url)
        r.raise_for_status()
        data = r.json()
        data_keys = list(data["streams"].keys())

        for stream in data_keys:
            name = stream.lower().replace(" ", "_")
            stream_url = f"https://live.kodicable.net/hls{name}/{name}/index.m3u8"

            frame = getthumb(stream_url, 5)
            if frame:
                frame = frame.resize((1280, 720), Image.LANCZOS)
                frame.save(f"out{name}.png")
            else:
                print(f"Stream {stream} is not reachable for PNGs")
            print(stream)

    except requests.exceptions.RequestException as e:
        print(f"Error fetching API data: {e}")


def genThumbnailGif():
    try:
        url = "http://localhost:4000/api/streams"
        r = requests.get(url)
        r.raise_for_status()
        data = r.json()
        data_keys = list(data["streams"].keys())

        for stream in data_keys:
            name = stream.lower().replace(" ", "_")
            stream_url = f"https://live.kodicable.net/hls{name}/{name}/index.m3u8"

            frames = []
            for i in range(10):  # Capture 10 frames
                frame = getthumb(stream_url, 5 + i)
                if frame:
                    frame = frame.resize((550, 323), Image.LANCZOS)
                    frames.append(np.array(frame))

            if frames:
                imageio.mimsave(f"out{name}.gif", frames, duration=0.1)
            else:
                print(f"Stream {stream} is not reachable for GIFs")
            print(stream)

    except requests.exceptions.RequestException as e:
        print(f"Error fetching API data: {e}")


genThumbnailGif()
genThumbnailPng()

schedule.every(2.5).minutes.do(genThumbnailGif)
schedule.every(2.5).minutes.do(genThumbnailPng)

while True:
    schedule.run_pending()
    time.sleep(1)
