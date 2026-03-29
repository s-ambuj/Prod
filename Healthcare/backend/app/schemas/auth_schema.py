from pydantic import BaseModel, EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: str | None = None
    email: str | None = None
    role: str | None = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "patient"

class RegisterResponse(BaseModel):
    id: str
    message: str

class PasswordChangeRequest(BaseModel):
    old_password: str
    new_password: str
