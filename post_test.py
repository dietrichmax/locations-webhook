import requests

url = "https://geodata.mxd.codes/tracking/locations"
myobj = {"lat": 21, "lon": 2}

x = requests.post(url, json = myobj)

print(x.text)