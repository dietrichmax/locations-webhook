import requests

url = "https://geodata.mxd.codes/tracking/locations?api_key=hntrmfJjwTPlJbrTaCW0sLZr6iP2XZIt"
myobj = {"lat": 21, "long": 2}

x = requests.post(url, json = myobj)

print(x.text)