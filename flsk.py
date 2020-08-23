from flask import Flask, render_template
app = Flask(__name__)

# url_for("/", filename = "index.html")

@app.route('/')
def test():
    return render_template('index.html')

@app.route("/log", methods = ["POST"])
def log():
    if request.method == 'POST':
        print("orient", request.form['orient'])
        print("location", request.form['location'])
if __name__ == "__main__":
    app.run(host = "0.0.0.0", port = "8080", debug = True)#, ssl_context = "adhoc")