class Config():
    DEBUG = False
    SQLALCHEMY_TRACK_MODIFICATIONS = True

class LocalDevelopmentConfig(Config):
    # configuration for database
    SQLALCHEMY_DATABASE_URI = "sqlite:///quizdb.sqlite3"
    DEBUG = True

    # configuration for security
    SECRET_KEY = "secretkeyforproject"  #hash user credentials in session
    SECURITY_PASSWORD_HASH = "bcrypt"   #mechanism for hashing password
    SECURITY_PASSWORD_SALT = "passwordsaltforkey"  # helps in hashing passwords
    WTF_CSRF_ENABLED = False                        
    SECURITY_TOKEN_AUTHENTICATION_HEADER = "Authentication-Token"