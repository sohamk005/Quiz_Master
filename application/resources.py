from flask_restful import Api, Resource, reqparse
from .models import *
from flask_security import auth_required, roles_accepted, roles_required, current_user
from application.database import db
from datetime import datetime, timedelta 
from .utils import roles_list 
from flask import request

api = Api()


# for subjects - -

parser = reqparse.RequestParser()
parser.add_argument('name')
parser.add_argument('description')


class SubjectApi(Resource):
    @auth_required('token')
    @roles_accepted('user', 'admin')
    def get(self):
        
        subject_id = request.args.get('id', type=int)
        if subject_id:
            subject = Subject.query.get(subject_id)
            
            if not subject:
                return [], 200

            return [{
                "id": subject.id,
                "name": subject.name,
                "description": subject.description
            }], 200
        else:
            subjects = Subject.query.all()
            if not subjects:
                return [], 200
            sub_json = []
            for sub in subjects:
                sub_json.append({
                    "id": sub.id,
                    "name": sub.name,
                    "description": sub.description,
                    
                })
            if not sub_json:
                return {"message": "No Subjects Added!"}, 404
            return sub_json, 200


    @auth_required('token')
    @roles_required('admin')
    def post(self):
        args = parser.parse_args()
        if not args["name"] or not args["description"]:
            return {"message": "One or More required fields are missing"}, 400
    
        try:
            subject = Subject(name=args["name"], description=args["description"])
            db.session.add(subject)
            db.session.commit()
            return {"message": "Subject created successfully"}
        except Exception as e:
            return {"message": str(e)}, 500 

    @auth_required('token')
    @roles_required('admin')
    def put(self, subject_id):
        args = parser.parse_args()
        sub = Subject.query.get(subject_id)
        sub.name = args['name']
        sub.description = args['description']
        db.session.commit()
        return {
            "message": "Subject details Updated!"
        }

    @auth_required('token')
    @roles_required('admin')
    def delete(self, subject_id):
        sub = Subject.query.get(subject_id)
        if(sub):
            db.session.delete(sub)
            db.session.commit()
            return {
                "message": "Subject Deleted Succesfully!"
            }
        else:
             return {
                "message": "Subject Not Found!"
            }, 404

# for chapters ---

chapter_parser = reqparse.RequestParser()
chapter_parser.add_argument('name', type=str, required=True, help="Chapter name is required", location='json')
chapter_parser.add_argument('description', type=str, required=True, help="Chapter description is required", location='json')
chapter_parser.add_argument('subject_id', type=int, required=True, help="Subject ID is required", location='json')

class ChapterApi(Resource):
    @auth_required('token')
    @roles_accepted('user', 'admin')
    def get(self):
        chapter_id = request.args.get('id', type=int)
        if chapter_id:
            chapter = Chapter.query.get(chapter_id)
            if chapter:
                return [{
                    "id": chapter.id,
                    "name": chapter.name,
                    "description": chapter.description,
                    "subject_id": chapter.subject_id
                }], 200
            else:
                return [], 200
        else:
            subject_id = request.args.get('subject_id', type=int)
            if subject_id:
                chapters = Chapter.query.filter_by(subject_id=subject_id).all()
            else:
                chapters = Chapter.query.all()
            if not chapters:
                return [], 200

            chapter_list = []
            for ch in chapters:
                chapter_list.append({
                    "id": ch.id,
                    "name": ch.name,
                    "description": ch.description,
                    "subject_id": ch.subject_id
                })
            return chapter_list, 200

    @auth_required('token')
    @roles_required('admin')
    def post(self):
        args = chapter_parser.parse_args()
        try:
            chapter = Chapter(name=args["name"], description=args["description"], subject_id=args["subject_id"])
            db.session.add(chapter)
            db.session.commit()
            return {"message": "Chapter created successfully"}, 201
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500

    @auth_required('token')
    @roles_required('admin')
    def put(self, chapter_id):
        args = chapter_parser.parse_args()
        chapter = Chapter.query.get(chapter_id)
        if not chapter:
            return {"message": "Chapter not found"}, 404
        chapter.name = args["name"]
        chapter.description = args["description"]
        chapter.subject_id = args["subject_id"]
        db.session.commit()
        return {"message": "Chapter updated successfully"}, 200

    @auth_required('token')
    @roles_required('admin')
    def delete(self, chapter_id):
        chapter = Chapter.query.get(chapter_id)
        if not chapter:
            return {"message": "Chapter not found"}, 404
        db.session.delete(chapter)
        db.session.commit()
        return {"message": "Chapter deleted successfully"}, 200

# for quizes - -

quiz_parser = reqparse.RequestParser()
quiz_parser.add_argument('chapter_id', type=int, required=True, help="Chapter ID is required", location='json')
quiz_parser.add_argument('time_duration', type=str, required=True, help="Time duration is required", location='json')
quiz_parser.add_argument('remarks', type=str, required=False, location='json')
quiz_parser.add_argument('date_of_quiz', type=str, required=False, help="Optional, format YYYY-MM-DD", location='json')
quiz_parser.add_argument('status', type=int, required=False, location='json')

class QuizApi(Resource):
    @auth_required('token')
    @roles_accepted('user', 'admin')
    def get(self):
        quiz_id = request.args.get('id', type=int)
        validate = request.args.get('validate', type=bool)
        
        if quiz_id:
            quiz = Quiz.query.get(quiz_id)
            if not quiz:
                return [], 200
            
            if validate:
                today = datetime.utcnow().date()
                if quiz.date_of_quiz != today:
                    return {"message": "Quiz not scheduled for today"}, 403
          
                if quiz.time_duration:
                    try:
                        hours, minutes = map(int, quiz.time_duration.split(':'))
                        quiz_duration = timedelta(hours=hours, minutes=minutes)
                        quiz_end_time = datetime.combine(quiz.date_of_quiz, datetime.min.time()) + quiz_duration
                        
                        if datetime.utcnow() > quiz_end_time:
                            return {"message": "Quiz is not active right now"}, 403
                    except ValueError:
                        return {"message": "Invalid time_duration format"}, 400

            return [{
                "id": quiz.id,
                "chapter_id": quiz.chapter_id,
                "date_of_quiz": quiz.date_of_quiz.strftime("%Y-%m-%d") if quiz.date_of_quiz else None,
                "time_duration": quiz.time_duration,
                "remarks": quiz.remarks
            }], 200
    
        chapter_id = request.args.get('chapter_id', type=int)
        if chapter_id:
            quizzes = Quiz.query.filter_by(chapter_id=chapter_id).all()
        else:
            quizzes = Quiz.query.all()

        if not quizzes:
            return [], 200

        quiz_list = [{
            "id": quiz.id,
            "chapter_id": quiz.chapter_id,
            "date_of_quiz": quiz.date_of_quiz.strftime("%Y-%m-%d") if quiz.date_of_quiz else None,
            "time_duration": quiz.time_duration,
            "remarks": quiz.remarks
        } for quiz in quizzes]

        return quiz_list, 200


    @auth_required('token')
    @roles_required('admin')
    def post(self):
        args = quiz_parser.parse_args()
        try:
            if args.get("date_of_quiz"):
                date_of_quiz = datetime.strptime(args["date_of_quiz"], "%Y-%m-%d").date()
            else:
                date_of_quiz = datetime.utcnow().date()
            quiz = Quiz(
                chapter_id=args["chapter_id"],
                time_duration=args["time_duration"],
                remarks=args.get("remarks"),
                date_of_quiz=date_of_quiz
            )
            db.session.add(quiz)
            db.session.commit()
            return {"message": "Quiz created successfully"}, 201
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500

    @auth_required('token')
    @roles_accepted('admin','user')
    def put(self, quiz_id):
        args = quiz_parser.parse_args()
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return {"message": "Quiz not found"}, 404
        quiz.chapter_id = args["chapter_id"]
        quiz.time_duration = args["time_duration"]
        quiz.remarks = args.get("remarks")
        if args.get("date_of_quiz"):
            try:
                quiz.date_of_quiz = datetime.strptime(args["date_of_quiz"], "%Y-%m-%d").date()
            except Exception:
                return {"message": "Invalid date format, expected YYYY-MM-DD"}, 400
        if args.get("status") is not None:
            quiz.status = args["status"]
        db.session.commit()
        return {"message": "Quiz updated successfully"}, 200

    @auth_required('token')
    @roles_required('admin')
    def delete(self, quiz_id):
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return {"message": "Quiz not found"}, 404
        db.session.delete(quiz)
        db.session.commit()
        return {"message": "Quiz deleted successfully"}, 200

# for Questions

question_parser = reqparse.RequestParser()
question_parser.add_argument('quiz_id', type=int, required=True, help="Quiz ID is required", location='json')
question_parser.add_argument('question_statement', type=str, required=True, help="Question statement is required", location='json')
question_parser.add_argument('option1', type=str, required=True, help="Option 1 is required", location='json')
question_parser.add_argument('option2', type=str, required=True, help="Option 2 is required", location='json')
question_parser.add_argument('option3', type=str, required=True, help="Option 3 is required", location='json')
question_parser.add_argument('option4', type=str, required=True, help="Option 4 is required", location='json')
question_parser.add_argument('correct_option', type=str, required=True, help="Correct option is required", location='json')

class QuestionApi(Resource):
    @auth_required('token')
    @roles_accepted('user', 'admin')
    def get(self):
        from flask import request
        question_id = request.args.get('id', type=int)
        if question_id:
            question = Question.query.get(question_id)
            if question:
                return [{
                    "id": question.id,
                    "quiz_id": question.quiz_id,
                    "question_statement": question.question_statement,
                    "option1": question.option1,
                    "option2": question.option2,
                    "option3": question.option3,
                    "option4": question.option4,
                    "correct_option": question.correct_option
                }], 200
            else:
                return [], 200
        else:
            quiz_id = request.args.get('quiz_id', type=int)
            if quiz_id:
                questions = Question.query.filter_by(quiz_id=quiz_id).all()
            else:
                questions = Question.query.all()
            if not questions:
                return [], 200

            question_list = []
            for q in questions:
                question_list.append({
                    "id": q.id,
                    "quiz_id": q.quiz_id,
                    "question_statement": q.question_statement,
                    "option1": q.option1,
                    "option2": q.option2,
                    "option3": q.option3,
                    "option4": q.option4,
                    "correct_option": q.correct_option
                })
            return question_list, 200

        
    @auth_required('token')
    @roles_required('admin')
    def post(self):
        args = question_parser.parse_args()
        try:
            new_question = Question(
                quiz_id=args["quiz_id"],
                question_statement=args["question_statement"],
                option1=args["option1"],
                option2=args["option2"],
                option3=args["option3"],
                option4=args["option4"],
                correct_option=args["correct_option"]
            )
            db.session.add(new_question)
            db.session.commit()
            return {"message": "Question created successfully", "id": new_question.id}, 201
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500


    @auth_required('token')
    @roles_required('admin')
    def put(self, question_id):
        args = question_parser.parse_args()
        question = Question.query.get(question_id)
        if not question:
            return {"message": "Question not found"}, 404
        question.quiz_id = args["quiz_id"]
        question.question_statement = args["question_statement"]
        question.option1 = args["option1"]
        question.option2 = args["option2"]
        question.option3 = args["option3"]
        question.option4 = args["option4"]
        question.correct_option = args["correct_option"]
        db.session.commit()
        return {"message": "Question updated successfully"}, 200

    @auth_required('token')
    @roles_required('admin')
    def delete(self, question_id):
        question = Question.query.get(question_id)
        if not question:
            return {"message": "Question not found"}, 404
        db.session.delete(question)
        db.session.commit()
        return {"message": "Question deleted successfully"}, 200
    
    #for Scores - 

score_parser = reqparse.RequestParser()
score_parser.add_argument('quiz_id', type=int, required=True, help="Quiz ID is required", location='json')
score_parser.add_argument('user_id', type=int, required=True, help="User ID is required", location='json')
score_parser.add_argument('total_scored', type=int, required=True, help="Score is required", location='json')

class ScoreApi(Resource):
    @auth_required('token')
    @roles_accepted('user', 'admin')
    def post(self):
        args = score_parser.parse_args()
        try:
            score = Score(
                quiz_id=args["quiz_id"],
                user_id=args["user_id"],
                total_scored=args["total_scored"]
            )
            db.session.add(score)
            db.session.commit()
            return {"message": "Score saved successfully"}, 201
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500

    @auth_required('token')
    @roles_accepted('user', 'admin')
    def get(self, user_id):
        scores = Score.query.filter_by(user_id=user_id).all()
        if not scores:
            return [], 200
        score_list = [{
            "id": score.id,
            "quiz_id": score.quiz_id,
            "total_scored": score.total_scored,
            "time_stamp_of_attempt": score.time_stamp_of_attempt.strftime("%Y-%m-%d %H:%M:%S")
        } for score in scores]
        return score_list, 200
    
    
# for Search - 
class SearchApi(Resource):
    @auth_required('token')
    @roles_accepted('user','admin')
    def get(self):
        from flask import request
        query = request.args.get('q', type=str)
        if not query:
            return {"message": "Query parameter 'q' is required"}, 400
        results = Subject.query.filter(Subject.name.ilike(f"%{query}%") | Subject.description.ilike(f"%{query}%")).all()
        subjects = [{
            "id": sub.id,
            "name": sub.name,
            "description": sub.description
        } for sub in results]
        return subjects, 200





# adding resources

api.add_resource(SubjectApi,
    '/api/subject/get',
    '/api/subject/create',
    '/api/subject/update/<int:subject_id>',
    '/api/subject/delete/<int:subject_id>')

api.add_resource(ChapterApi,
    '/api/chapter/get',
    '/api/chapter/create',
    '/api/chapter/update/<int:chapter_id>',
    '/api/chapter/delete/<int:chapter_id>')

api.add_resource(QuizApi,
    '/api/quiz/get',
    '/api/quiz/create',
    '/api/quiz/update/<int:quiz_id>',
    '/api/quiz/delete/<int:quiz_id>')

api.add_resource(QuestionApi,
    '/api/question/get',
    '/api/question/create',
    '/api/question/update/<int:question_id>',
    '/api/question/delete/<int:question_id>')

api.add_resource(ScoreApi,
    '/api/score',
    '/api/score/<int:user_id>')

api.add_resource(SearchApi,
    '/api/search')

