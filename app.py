from flask import Flask, request, jsonify
from application.database import db
from application.models import User, Role
from application.resources import api
from application.config import LocalDevelopmentConfig
from flask_security import Security, SQLAlchemyUserDatastore
from flask_security import hash_password
from werkzeug.security import check_password_hash, generate_password_hash
from application.celery_init import celery_init_app
from celery.schedules import crontab
from application.tasks import monthly_report


def create_app():
    app = Flask(__name__)
    app.config.from_object(LocalDevelopmentConfig)
    db.init_app(app)
    
    datastore = SQLAlchemyUserDatastore(db, User, Role)
    app.security = Security(app, datastore)

    api.init_app(app)
    
    app.app_context().push()
    return app

app = create_app()

celery = celery_init_app(app)

celery.autodiscover_tasks()


with app.app_context():
    db.create_all()

    app.security.datastore.find_or_create_role(name = "admin", description = "Super user")
    app.security.datastore.find_or_create_role(name = "user", description = "General user")
    db.session.commit()

    if not app.security.datastore.find_user(email = "user0@admin.com"):
        app.security.datastore.create_user(email = "user0@admin.com", username = "admin", password = generate_password_hash("12345"), roles = ['admin'] )       

    if not app.security.datastore.find_user(email = "user1@user.com"):
        app.security.datastore.create_user(email = "user1@user.com", username = "user", password = generate_password_hash("12345"), roles = ['user'] )       

    db.session.commit()

from application.routes import *

@celery.on_after_finalize.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(
        crontab(minute = '*/2'),
        monthly_report.s(),
    )





if __name__ == "__main__":
    app.run()
