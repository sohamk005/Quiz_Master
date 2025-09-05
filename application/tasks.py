from celery import shared_task
from .models import User, Subject, Quiz, Score
from .utils import format_report
from .mail import send_email
import time
import datetime
import csv

@shared_task(ignore_results = False, name = "download_csv_report")
def csv_report():
    quizzes = Quiz.query.all()
    csv_file = f"quiz_{datetime.datetime.now().strftime("%f")}.csv"
    with open(f'static/{csv_file}', 'w', newline="") as csvfile:
        sr_no = 1
        quiz_csv = csv.writer(csvfile, delimiter=',')
        quiz_csv.writerow(['Sr No.', 'id', 'chapter_id', 'date_of_quiz', 'time_duration', 'remarks'])
        for q in quizzes:
            this_quiz = [sr_no, q.id, q.chapter_id, q.date_of_quiz, q.time_duration, q.remarks ]
            quiz_csv.writerow(this_quiz)
            sr_no += 1

    return csv_file

@shared_task(ignore_results = False, name = "monthly_report")
def monthly_report():
    users = User.query.all()
    quizzes = Quiz.query.all()
    for user in users[1:]:
        user_data = {}
        user_data['username'] = user.username
        user_data['email'] = user.email
        user_quiz = []
        for q in quizzes:
            this_quiz = {}
            this_quiz["id"] = q.id
            this_quiz["chapter"] = q.chapter.name
            this_quiz["date_of_quiz"] = q.date_of_quiz
            this_quiz["time_duration"] = q.time_duration
            this_quiz["remarks"] = q.remarks
            user_quiz.append(this_quiz)
        user_data['quizzes'] = user_quiz
        message = format_report('templates/mail_details.html', user_data)
        send_email(user.email, subject = "Monthly Quiz Report - Quiz Master V2", message = message)
    return "Monthly reports sent"

@shared_task(ignore_results = False, name = "quiz_update")
def quiz_update():
    return "quiz updates sent"
