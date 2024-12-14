import requests

url = "http://localhost:3000"
myobj = {"lat": 1, "lon": 1}

x = requests.post(url, json = myobj)

print(x.text)