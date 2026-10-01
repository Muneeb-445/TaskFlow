from pydantic import BaseModel,EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    
class ForgotPasswordRequest(BaseModel):
    email: EmailStr
    
class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str