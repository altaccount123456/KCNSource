import time
import schedule
import subprocess
import requests

def gen_thumbnail():
    # get all the streams from API
    url = f"https://streams.kodicable.net/api/streams/"
    # do a request and get the json data
    r = requests.get(url)
    data = r.json()
    # example of the json data: {"streams":[{"name":"TMC","url":"https://live.kodicable.net/hlstmc/tmc/index.m3u8","live":"No","rating":"","title":"TMC","thumbnail":"https://live.kodicable.net/hlstmc/outtmc.png"},{"name":"WPEY","url":"https://live.kodicable.net/hlswpey/wpey/index.m3u8","rating":"e","live":"Yes","title":"WPEY | Live Weather and EAS Coverage","thumbnail":"https://live.kodicable.net/hlswpey/outwpey.png"},{"name":"CFSP","url":"https://live.kodicable.net/hlscfsp/cfsp/index.m3u8","rating":"e","live":"Yes","title":"Type title here","thumbnail":"https://live.kodicable.net/hlscfsp/outcfsp.png"},{"name":"WTSC","url":"https://live.kodicable.net/hlswtsc/wtsc/index.m3u8","live":"No","rating":"","title":"I HATEKODICALBE IT SUCKS SO MUCH","thumbnail":"https://live.kodicable.net/hlswtsc/outwtsc.png"},{"name":"KIWS","url":"https://live.kodicable.net/hlskiws/kiws/index.m3u8","live":"No","rating":"","title":"i like popy but farts","thumbnail":"https://live.kodicable.net/hlskiws/outkiws.png"},{"name":"WCSG","url":"https://live.kodicable.net/hlswcsg/wcsg/index.m3u8","live":"No","rating":"","title":"WCSG 9","thumbnail":"https://live.kodicable.net/hlswcsg/outwcsg.png"},{"name":"KCWT","url":"https://live.kodicable.net/hlskcwt/kcwt/index.m3u8","live":"No","rating":"e","title":"k                   c                        w                         t","thumbnail":"https://live.kodicable.net/hlskcwt/outkcwt.png"},{"name":"WKAB","url":"https://live.kodicable.net/hlswkab/wkab/index.m3u8","live":"No","rating":"","title":"WKAB","thumbnail":"https://live.kodicable.net/hlswkab/outwkab.png"},{"name":"FUSION","url":"https://live.kodicable.net/hlsfusion/fusion/index.m3u8","live":"No","rating":"e","title":"Fusion (TEST)","thumbnail":"https://live.kodicable.net/hlsfusion/outfusion.png"},{"name":"TDCWSCAN","url":"https://live.kodicable.net/hlstdcwscan/tdcwscan/index.m3u8","live":"No","rating":"","title":"Weatherscan LIVE - The Dorian Channel","thumbnail":"https://live.kodicable.net/hlstdcwscan/outtdcwscan.png"},{"name":"TDCHD","url":"https://live.kodicable.net/hlstdchd/tdchd/index.m3u8","live":"No","rating":"e","title":"The Dorian Channel - Live Report","thumbnail":"https://live.kodicable.net/hlstdchd/outtdchd.png"},{"name":"WCMO","url":"https://live.kodicable.net/hlswcmo/wcmo/index.m3u8","live":"No","rating":"","title":"Central Missouri Weather Coverage","thumbnail":"https://live.kodicable.net/hlswcmo/outwcmo.png"},{"name":"KMAR","url":"https://live.kodicable.net/hlskmar/kmar/index.m3u8","live":"No","rating":"p","title":"KMAR Radar Loop at 7:30 PM","thumbnail":"https://live.kodicable.net/hlskmar/outkmar.png"}]}
    for stream in data["streams"]:
        name = stream["name"].lower()
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
            f"livestream/hls{name}/out{name}.png"
        ] 
        try:
            subprocess.call(ffmpeg_command)
        except subprocess.CalledProcessError as e:
            print(f"Error executing ffmpeg: {e}")
        print(stream)


schedule.every(2.5).minutes.do(gen_thumbnail)

while True:
    schedule.run_pending()
    time.sleep(1)