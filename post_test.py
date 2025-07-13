import requests

url = "https://geodata.mxd.codes/tracking/locations?api_key=hntrmfJjwTPlJbrTaCW0sLZr6iP2XZIt"
myobj = {"lat": 1, "lon": 1}

x = requests.post(url, json = myobj)

print(x.text)