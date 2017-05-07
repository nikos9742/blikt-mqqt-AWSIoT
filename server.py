from flask import Flask
from flask_cors import CORS, cross_origin
import time
import blinkt
import colorsys
from blinkt import set_clear_on_exit, set_all, show
from flask import request
app = Flask(__name__)

@app.route("/")
@cross_origin()
def hello():
    return "Hello World!"

@app.route('/led', methods=['GET', 'POST'])
@cross_origin()
def led():
    if request.method == 'POST':
	var1 = request.get_json()
	print var1 
        blinkt.set_all(var1['color']['r'],var1['color']['g'],var1['color']['b'],var1['brightness'])
	blinkt.show()
	return "OK"
    else:
        return "colors"

@app.route('/rainbow', methods=['GET', 'POST'])
@cross_origin()
def rainbow():
    if request.method == 'POST':
        var2 = request.get_json()
        blinkt.set_clear_on_exit()
        blinkt.set_brightness(1)
        spacing = 360.0 / 16.0
        hue = 0
        count = 1

	while (count < 3000):
    	    hue = int(time.time() * 100) % 360
    	    count = count + 1
            for x in range(blinkt.NUM_PIXELS):
				offset = x * spacing
				h = ((hue + offset) % 360) / 360.0
				r, g, b = [int(c*255) for c in colorsys.hsv_to_rgb(h, 1.0, 1.0)]
				blinkt.set_pixel(x, r, g, b)

    	    blinkt.show()
    	    time.sleep(0.0002)
	        

        return "OK"
    else:
        return "rainbow"

	
if __name__ == "__main__":
    app.run(host= '0.0.0.0')
    blinkt.set_clear_on_exit()

