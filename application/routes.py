from application.database import db
from application.tasks import csv_report, monthly_report
from flask import current_app as app, jsonify, request, render_template, send_from_directory
from flask_security import auth_required, roles_required, roles_accepted, current_user, login_user
from werkzeug.security import check_password_hash, generate_password_hash
from .utils import roles_list 
from application.models import Score
from celery.result import AsyncResult


@app.route('/', methods = ['GET'])
def home():
    return render_template('index.html')

@app.route('/api/admin')
@auth_required('token')
@roles_required('admin')
def admin_route():
    return jsonify({
        "message": "admin logged in succesfully"
    })

@app.route('/api/home')
@auth_required('token')
@roles_accepted('user','admin')
def user_home():
    user = current_user
    return jsonify({
        "username": user.username,
        "email": user.email,
        "roles": roles_list(user.roles)
    })

@app.route('/api/scores')
@auth_required('token')
@roles_accepted('user','admin')
def user_scores():
    user = current_user 
    scores = Score.query.filter_by(user_id=user.id).all()
    scores_data = [{"quiz_id": score.quiz_id, "score": score.total_scored, "date": score.time_stamp_of_attempt} for score in scores]

    return jsonify({
        "scores": scores_data
    })

@app.route('/api/login', methods=['POST'])
def user_login():
    body = request.get_json()
    email = body['email']
    password = body['password']

    if not email:
        return jsonify({
            "message": "Email is required!"
        }), 400

    user = app.security.datastore.find_user(email = email)

    if user:
        if check_password_hash(user.password, password):
            '''if current_user:
                return jsonify({
                    "message": "Already logged in!"
                }), 400'''
            login_user(user)
            return jsonify({
                "id": user.id,
                "username": user.username,
                "auth-token": user.get_auth_token(),
                "roles": roles_list(user.roles)
            })
        else:
            return jsonify({
                "message": "Incorrect Password!"
            }), 400
    else:
            return jsonify({
                "message": "User Not Found!"
            }), 404



@app.route('/api/register', methods=['POST'])
def create_user():
    credentials = request.get_json()
    if not app.security.datastore.find_user(email = credentials["email"]):
        app.security.datastore.create_user(email = credentials["email"], username = credentials["username"], password = generate_password_hash(credentials["password"]), roles = ['user'] )       

        db.session.commit()
        return jsonify({
            "message": "User Created succesfully!"
        }), 201

    return jsonify({
            "message": "User Already Existing!"
        }), 400


# manualy trigger job
@app.route('/api/export')
def export_csv():
    result = csv_report.delay()
    return jsonify({
        "id": result.id,
        "result": result.result,
    })

@app.route('/api/csv_result/<id>')
def csv_result(id):
    res = AsyncResult(id)
    return send_from_directory('static', res.result)

@app.route('/api/mail')
def send_reports():
    res = monthly_report.delay()
    return {
        "result": res.result
    }
