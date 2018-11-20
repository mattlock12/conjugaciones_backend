import uuid

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate


app = Flask(__name__)
app.config['DEBUG'] = True
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://localhost/conjugaciones"
app.secret_key = str(uuid.uuid4())
db = SQLAlchemy(app)
migrate = Migrate(app, db)
