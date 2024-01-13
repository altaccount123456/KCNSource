import time
import schedule
import subprocess
import requests


def gen_thumbnailPng():
    # get all the streams from API
    url = f"http://localhost:4000/api/streams"
    # do a request and get the json data
    r = requests.get(url)
    data = r.json()

    dataKeys = (list(data["streams"].keys()))

    for stream in dataKeys:
        name = stream.lower().replace(" ", "_")
        ffmpeg_command = [
            # make a thumbnail with the res of 1280 x 720
            # REPLACE WITH "ffmpeg" THIS IS JUST FOR DEVELOPMENT
            r'C:\PATH_Programs\ffmpeg',
            '-i', f"https://live.kodicable.net/hls{name}/{name}/index.m3u8",
            '-vframes', '1',  
            '-vf', 'scale=1280:720',  
            '-ss', '00:00:05',  
            '-y', 
            '-update', '1',  
            f"out{name}.png"
        ] 
        try:
            subprocess.call(ffmpeg_command)
        except subprocess.CalledProcessError as e:
            print(f"Error executing ffmpeg: {e}")
        print(stream)

def gen_thumbnailGif():
    # get all the streams from API
    url = f"http://localhost:4000/api/streams"
    # do a request and get the json data
    r = requests.get(url)
    data = r.json()

    dataKeys = (list(data["streams"].keys()))
    print(dataKeys)

    for stream in dataKeys:
        print(stream)
        name = stream.lower().replace(" ", "_")

        ffmpeg_command = [
            # make a thumbnail with the res of 1280 x 720 gif
            # REPLACE WITH "ffmpeg" THIS IS JUST FOR DEVELOPMENT
            r'C:\PATH_Programs\ffmpeg',
            '-i', f"https://live.kodicable.net/hls{name}/{name}/index.m3u8",
            '-ss', '00:00:05',
            '-t', '5',
            '-r', '10',
            '-vf', 'scale=235:138',
            '-y', 
            '-update', '1',  
            f"out{name}.gif"
        ] 
        try:
            subprocess.call(ffmpeg_command)
        except subprocess.CalledProcessError as e:
            print(f"Error executing ffmpeg: {e}")
        print(stream)

        
gen_thumbnailGif()
gen_thumbnailPng()

schedule.every(2.5).minutes.do(gen_thumbnailGif)
schedule.every(2.5).minutes.do(gen_thumbnailPng)


while True:
    schedule.run_pending()
    time.sleep(1)