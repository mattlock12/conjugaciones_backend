import uuid

from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy


app = Flask(__name__)
CORS(app)
app.config['DEBUG'] = True
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://mattmatt:mattmatt@db:5432/conjugaciones"
app.secret_key = str(uuid.uuid4())
db = SQLAlchemy(app)
