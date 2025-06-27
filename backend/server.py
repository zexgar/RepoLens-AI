from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.responses import RedirectResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import openai
import json

# Google Auth imports
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
import jwt


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# OpenAI setup
openai_api_key = os.environ.get('OPENAI_API_KEY')
if not openai_api_key:
    logging.warning("OPENAI_API_KEY not found in environment variables")
else:
    openai.api_key = openai_api_key

# Google OAuth setup
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
SCOPES = [
    'https://www.googleapis.com/auth/calendar.readonly', 
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'openid'
]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class CalendarAnalysisRequest(BaseModel):
    calendar_data: str
    time_period: Optional[str] = "this week"

class GoogleAuthRequest(BaseModel):
    token: str

class CalendarAnalysisResponse(BaseModel):
    independence_percentage: int
    witty_message: str
    detailed_analysis: str
    meeting_stats: dict
    recommendations: List[str]

class UserToken(BaseModel):
    user_id: str
    access_token: str
    refresh_token: Optional[str] = None
    token_expiry: Optional[datetime] = None
    user_email: str
    user_name: str

# Helper functions
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from JWT token"""
    try:
        token = credentials.credentials
        # Try to decode with our simple secret first
        try:
            payload = jwt.decode(token, "secret", algorithms=['HS256'])
        except:
            # Fallback to Google JWT (no verification for demo)
            payload = jwt.decode(token, options={"verify_signature": False})
        
        user_email = payload.get('user_email') or payload.get('email')
        
        if not user_email:
            raise HTTPException(status_code=401, detail="Invalid token - no email found")
            
        # Get user from database
        user = await db.users.find_one({"user_email": user_email})
        if not user:
            raise HTTPException(status_code=401, detail=f"User not found: {user_email}")
            
        return user
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Authentication error: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid authentication")

def get_calendar_service(access_token: str):
    """Create Google Calendar service with access token"""
    credentials = Credentials(token=access_token)
    return build('calendar', 'v3', credentials=credentials)

def format_calendar_events(events: List[Dict]) -> str:
    """Format Google Calendar events into readable text for AI analysis"""
    if not events:
        return "No scheduled commitments found in the specified time period."
    
    formatted_events = []
    for event in events:
        summary = event.get('summary', 'No title')
        
        # Handle different date/time formats
        start = event.get('start', {})
        end = event.get('end', {})
        
        if 'dateTime' in start:
            start_time = datetime.fromisoformat(start['dateTime'].replace('Z', '+00:00'))
            end_time = datetime.fromisoformat(end['dateTime'].replace('Z', '+00:00'))
            
            # Format times nicely
            start_str = start_time.strftime('%I:%M %p')
            end_str = end_time.strftime('%I:%M %p')
            date_str = start_time.strftime('%Y-%m-%d')
            
            formatted_events.append(f"{date_str} {start_str} - {end_str}: {summary}")
        elif 'date' in start:
            # All-day events
            formatted_events.append(f"{start['date']}: {summary} (All day)")
    
    return "\n".join(formatted_events)

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Liberty Tracker - Time Freedom Calculator API 🇺🇸"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

@api_router.post("/auth/google")
async def auth_google(request: GoogleAuthRequest):
    """Handle Google OAuth token from frontend"""
    try:
        # Decode the Google JWT token
        payload = jwt.decode(request.token, options={"verify_signature": False})
        
        user_email = payload.get('email')
        user_name = payload.get('name')
        user_id = payload.get('sub')
        
        if not user_email:
            raise HTTPException(status_code=400, detail="Invalid Google token")
        
        # For this demo, we'll create a simple JWT token
        # In production, you'd want proper JWT signing
        user_token = {
            "user_id": user_id,
            "user_email": user_email,
            "user_name": user_name,
            "exp": datetime.utcnow() + timedelta(hours=24)
        }
        
        # Store user in database
        await db.users.update_one(
            {"user_email": user_email},
            {"$set": {
                "user_id": user_id,
                "user_email": user_email,
                "user_name": user_name,
                "last_login": datetime.utcnow()
            }},
            upsert=True
        )
        
        # Create a simple token (in production, use proper JWT signing)
        token = jwt.encode(user_token, "secret", algorithm="HS256")
        
        return {
            "access_token": token,
            "user": {
                "email": user_email,
                "name": user_name,
                "id": user_id
            }
        }
        
    except Exception as e:
        logging.error(f"Google auth error: {str(e)}")
        raise HTTPException(status_code=400, detail="Authentication failed")

@api_router.get("/auth/google-calendar")
async def auth_google_calendar():
    """Initiate Google Calendar OAuth flow"""
    try:
        # Create flow instance
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token"
                }
            },
            scopes=SCOPES
        )
        
        # Set redirect URI
        flow.redirect_uri = "https://dd2e7103-bf7a-4ae0-924e-309ae4635203.preview.emergentagent.com/api/auth/callback"
        
        # Generate OAuth URL
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true'
        )
        
        return {"authorization_url": authorization_url, "state": state}
        
    except Exception as e:
        logging.error(f"OAuth flow error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create OAuth flow")

@api_router.get("/auth/callback")
async def auth_callback(code: str, state: str = None):
    """Handle OAuth callback"""
    try:
        # Create flow instance with exact same scopes
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token"
                }
            },
            scopes=SCOPES
        )
        
        flow.redirect_uri = "https://dd2e7103-bf7a-4ae0-924e-309ae4635203.preview.emergentagent.com/api/auth/callback"
        
        # Exchange code for token - disable scope validation
        try:
            flow.fetch_token(code=code)
            credentials = flow.credentials
        except Exception as token_error:
            logging.error(f"Token exchange error: {str(token_error)}")
            # Try without strict scope validation
            flow = Flow.from_client_config(
                {
                    "web": {
                        "client_id": GOOGLE_CLIENT_ID,
                        "client_secret": GOOGLE_CLIENT_SECRET,
                        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                        "token_uri": "https://oauth2.googleapis.com/token"
                    }
                },
                scopes=None  # Don't validate scopes
            )
            flow.redirect_uri = "https://dd2e7103-bf7a-4ae0-924e-309ae4635203.preview.emergentagent.com/api/auth/callback"
            flow.fetch_token(code=code)
            credentials = flow.credentials
        
        # Get user info
        user_info_service = build('oauth2', 'v2', credentials=credentials)
        user_info = user_info_service.userinfo().get().execute()
        
        user_email = user_info.get('email')
        user_name = user_info.get('name')
        user_id = user_info.get('id')
        
        if not user_email:
            raise Exception("Failed to get user email from Google")
        
        # Store credentials in database
        await db.user_tokens.update_one(
            {"user_email": user_email},
            {"$set": {
                "user_id": user_id,
                "user_email": user_email,
                "user_name": user_name,
                "access_token": credentials.token,
                "refresh_token": credentials.refresh_token,
                "token_expiry": credentials.expiry,
                "created_at": datetime.utcnow()
            }},
            upsert=True
        )
        
        # Also store user for JWT token lookup
        await db.users.update_one(
            {"user_email": user_email},
            {"$set": {
                "user_id": user_id,
                "user_email": user_email,
                "user_name": user_name,
                "last_login": datetime.utcnow()
            }},
            upsert=True
        )
        
        logging.info(f"Successfully stored credentials for user: {user_email}")
        
        # Create a simple JWT token for frontend authentication
        user_token = {
            "user_id": user_id,
            "user_email": user_email,
            "user_name": user_name,
            "exp": datetime.utcnow() + timedelta(hours=24)
        }
        
        # Create a simple token (in production, use proper JWT signing)
        jwt_token = jwt.encode(user_token, "secret", algorithm="HS256")
        
        # Redirect to frontend with success and token
        return RedirectResponse(url=f"https://dd2e7103-bf7a-4ae0-924e-309ae4635203.preview.emergentagent.com/?auth=success&token={jwt_token}&user={user_email}&name={user_name}")
        
    except Exception as e:
        logging.error(f"OAuth callback error: {str(e)}")
        return RedirectResponse(url="https://dd2e7103-bf7a-4ae0-924e-309ae4635203.preview.emergentagent.com/?auth=error")

@api_router.get("/calendar/events")
async def get_calendar_events(
    time_period: str = "this_week",
    user: dict = Depends(get_current_user)
):
    """Fetch calendar events for the authenticated user"""
    try:
        # Get user's stored credentials
        user_tokens = await db.user_tokens.find_one({"user_email": user["user_email"]})
        if not user_tokens or not user_tokens.get("access_token"):
            raise HTTPException(status_code=401, detail="Calendar access not authorized")
        
        # Calculate time range
        now = datetime.utcnow()
        if time_period == "today":
            time_min = now.replace(hour=0, minute=0, second=0, microsecond=0)
            time_max = time_min + timedelta(days=1)
        elif time_period == "this_week":
            days_since_monday = now.weekday()
            time_min = (now - timedelta(days=days_since_monday)).replace(hour=0, minute=0, second=0, microsecond=0)
            time_max = time_min + timedelta(days=7)
        elif time_period == "this_month":
            time_min = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            next_month = time_min.replace(month=time_min.month + 1) if time_min.month < 12 else time_min.replace(year=time_min.year + 1, month=1)
            time_max = next_month
        else:  # recent_days (last 7 days)
            time_min = (now - timedelta(days=7)).replace(hour=0, minute=0, second=0, microsecond=0)
            time_max = now
        
        # Get calendar service
        service = get_calendar_service(user_tokens["access_token"])
        
        # Fetch events
        events_result = service.events().list(
            calendarId='primary',
            timeMin=time_min.isoformat() + 'Z',
            timeMax=time_max.isoformat() + 'Z',
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        
        events = events_result.get('items', [])
        
        return {
            "events": events,
            "count": len(events),
            "time_period": time_period,
            "time_range": {
                "start": time_min.isoformat(),
                "end": time_max.isoformat()
            }
        }
        
    except Exception as e:
        logging.error(f"Error fetching calendar events: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch calendar events")

@api_router.post("/analyze-calendar-auto", response_model=CalendarAnalysisResponse)
async def analyze_calendar_auto(
    time_period: str = "this_week",
    user: dict = Depends(get_current_user)
):
    """Automatically analyze user's calendar using Google Calendar API"""
    try:
        # Get user's calendar events
        events_data = await get_calendar_events(time_period, user)
        events = events_data["events"]
        
        # Format events for AI analysis
        calendar_data = format_calendar_events(events)
        
        if not calendar_data or calendar_data == "No scheduled commitments found in the specified time period.":
            return CalendarAnalysisResponse(
                independence_percentage=95,
                witty_message="You're 95% free! Either you've achieved the American dream of total freedom, or your calendar is having technical difficulties. We're going with the dream!",
                detailed_analysis="Your schedule is remarkably free of commitments - a true testament to the pursuit of liberty! You've either mastered the art of saying 'no' to unnecessary obligations, or you've found the secret to living the independent life our founding fathers envisioned. Either way, you're living proof that time freedom is possible in America!",
                meeting_stats={
                    "total_meetings": 0,
                    "total_hours": 0,
                    "avg_meeting_length": 0,
                    "longest_meeting_free_block": "Your entire schedule - pure freedom!"
                },
                recommendations=[
                    "Keep defending your time freedom like the patriots defended liberty!",
                    "Share your time independence secrets with fellow Americans",
                    "Use this freedom for pursuing happiness and meaningful work",
                    "Consider if you're missing important collaborations while enjoying your liberty"
                ]
            )
        
        # Mock Analysis - Generate realistic results based on schedule data
        total_events = len(events)
        total_hours = sum((event['end'] - event['start']).total_seconds() / 3600 for event in events)
        
        # Calculate freedom percentage based on actual data
        if time_period.lower() in ['today', 'recent days']:
            available_hours = 16  # Assume 16 waking hours
        elif 'week' in time_period.lower():
            available_hours = 112  # 16 hours * 7 days
        elif 'month' in time_period.lower():
            available_hours = 480  # 16 hours * 30 days
        else:
            available_hours = 112
            
        occupied_percentage = min((total_hours / available_hours) * 100, 100)
        freedom_percentage = max(100 - occupied_percentage, 10)
        
        # Generate dynamic mock response based on actual schedule data
        if freedom_percentage >= 70:
            witty_message = f"🎆 Amazing! You're {int(freedom_percentage)}% free! You've achieved true independence from schedule tyranny!"
            analysis = f"Congratulations, you patriotic time manager! With {int(freedom_percentage)}% freedom, you're living the American dream of work-life balance. Your schedule shows excellent time sovereignty - you've successfully declared independence from over-scheduling. Like the founding fathers intended, you have ample time for the pursuit of happiness. Your {total_events} commitments are well-spaced, allowing for spontaneous adventures and personal liberty. This level of freedom would make Benjamin Franklin proud!"
        elif freedom_percentage >= 40:
            witty_message = f"⚡ Good news! You're {int(freedom_percentage)}% free - that's a solid B+ in the school of liberty!"
            analysis = f"You're on the path to time independence! With {int(freedom_percentage)}% freedom, you're like America in 1776 - ready to break free but still working on it. Your {total_events} scheduled commitments show you're productive, but you still have room to breathe. The founding fathers would approve of your balanced approach to duty and liberty. Consider this your Declaration of Improved Time Management - you're doing well, but there's still room to pursue more happiness!"
        else:
            witty_message = f"🚨 Alert! You're only {int(freedom_percentage)}% free - time to stage a revolution against your packed schedule!"
            analysis = f"Houston, we have a freedom problem! At {int(freedom_percentage)}% liberty, you're more scheduled than a presidential campaign. Your {total_events} commitments are staging a coup against your free time. But fear not, fellow American - every great revolution starts with recognizing the problem. It's time to channel your inner George Washington and lead a rebellion against over-scheduling. Remember: life, liberty, and the pursuit of happiness - not just endless meetings!"
        
        # Calculate realistic stats
        avg_duration = total_hours / max(total_events, 1)
        longest_gap = "2-3 hours" if freedom_percentage > 60 else "1-2 hours" if freedom_percentage > 30 else "30-60 minutes"
        
        # Generate recommendations based on freedom level
        recommendations = []
        if freedom_percentage < 40:
            recommendations = [
                "Declare independence from unnecessary meetings - audit your commitments",
                "Block 'Constitution Hours' - sacred time blocks that cannot be scheduled over",
                "Practice the Boston Tea Party method - dump commitments that don't serve you",
                "Implement the Bill of Rights for your calendar - right to free time",
                "Create buffer zones between meetings like DMZ between conflicts"
            ]
        elif freedom_percentage < 70:
            recommendations = [
                "Batch similar activities like the Continental Congress - efficiency through grouping",
                "Establish 'pursuit of happiness' time blocks for hobbies and relaxation",
                "Use the Jefferson method - delegate tasks that others can handle",
                "Create morning or evening 'independence hours' for personal time",
                "Practice saying 'no' like you're ratifying the Constitution - carefully but firmly"
            ]
        else:
            recommendations = [
                "You're doing great! Maintain your freedom with regular schedule audits",
                "Share your time management wisdom like a founding father",
                "Use your free time for meaningful pursuits and relationships",
                "Consider mentoring others in the art of schedule liberation",
                "Keep defending your boundaries like patriots defended their liberty"
            ]
        
        result = {
            "independence_percentage": int(freedom_percentage),
            "witty_message": witty_message,
            "detailed_analysis": analysis,
            "meeting_stats": {
                "total_meetings": total_events,
                "total_hours": f"{total_hours:.1f}",
                "avg_meeting_length": f"{avg_duration:.1f} hours" if avg_duration >= 1 else f"{int(avg_duration * 60)} minutes",
                "longest_meeting_free_block": longest_gap
            },
            "recommendations": recommendations[:5]  # Limit to 5 recommendations
        }

        return CalendarAnalysisResponse(**result)

    except Exception as e:
        logging.error(f"Error analyzing calendar: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@api_router.post("/analyze-calendar", response_model=CalendarAnalysisResponse)
async def analyze_calendar(request: CalendarAnalysisRequest):
    """Manual calendar analysis with patriotic theme - Using mock analysis"""
    try:
        # Parse the calendar data to extract events
        events = []
        lines = request.calendar_data.strip().split('\n')
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            try:
                # Simple parsing for common formats
                if ':' in line:
                    # Try to extract time information
                    if 'AM' in line or 'PM' in line:
                        # Time-based event
                        parts = line.split(':')
                        time_part = parts[0].strip()
                        event_name = ':'.join(parts[1:]).strip()
                        
                        # For mock purposes, create events with 1-hour duration
                        events.append({
                            'start': datetime.now(),
                            'end': datetime.now() + timedelta(hours=1),
                            'summary': event_name
                        })
                    else:
                        # All-day or simple event
                        events.append({
                            'start': datetime.now(),
                            'end': datetime.now() + timedelta(hours=2),
                            'summary': line
                        })
                else:
                    # Simple event description
                    events.append({
                        'start': datetime.now(),
                        'end': datetime.now() + timedelta(hours=1),
                        'summary': line
                    })
            except Exception:
                # If parsing fails for this line, create a default event
                events.append({
                    'start': datetime.now(),
                    'end': datetime.now() + timedelta(hours=1),
                    'summary': line
                })
        
        # If no events were parsed, create a default one
        if not events:
            events = [{
                'start': datetime.now(),
                'end': datetime.now() + timedelta(hours=1),
                'summary': 'Sample Event'
            }]
        
        # Mock Analysis - Generate realistic results based on schedule data
        total_events = len(events)
        total_hours = sum((event['end'] - event['start']).total_seconds() / 3600 for event in events)
        
        # Calculate freedom percentage based on actual data
        if request.time_period.lower() in ['today', 'recent days']:
            available_hours = 16  # Assume 16 waking hours
        elif 'week' in request.time_period.lower():
            available_hours = 112  # 16 hours * 7 days
        elif 'month' in request.time_period.lower():
            available_hours = 480  # 16 hours * 30 days
        else:
            available_hours = 112
            
        occupied_percentage = min((total_hours / available_hours) * 100, 100) if available_hours > 0 else 0
        freedom_percentage = max(100 - occupied_percentage, 10)
        
        # Generate dynamic mock response based on actual schedule data
        if freedom_percentage >= 70:
            witty_message = f"🎆 Outstanding! You're {int(freedom_percentage)}% free! You've mastered the art of schedule independence!"
            analysis = f"Bravo, time freedom champion! With {int(freedom_percentage)}% liberty, you're living the American dream of perfect work-life balance. Your {total_events} commitments are strategically placed, giving you ample time for the pursuit of happiness. Like a true patriot, you've successfully declared independence from over-scheduling. The founding fathers would be proud of your time sovereignty - you understand that true freedom includes having control over your own schedule!"
        elif freedom_percentage >= 40:
            witty_message = f"⚡ Solid work! You're {int(freedom_percentage)}% free - on your way to schedule liberation!"
            analysis = f"You're making great progress on your journey to time independence! At {int(freedom_percentage)}% freedom, you're like America in its early days - establishing your independence but still working on perfecting it. Your {total_events} scheduled items show you're productive while maintaining some personal liberty. The path to time freedom is clear ahead - just a few more strategic decisions and you'll be living the schedule of a true free American!"
        else:
            witty_message = f"🚨 Time for revolution! You're only {int(freedom_percentage)}% free - let's stage a rebellion against your packed schedule!"
            analysis = f"Fellow American, your schedule needs a Declaration of Independence! At just {int(freedom_percentage)}% liberty, you're more bound than the colonies were before 1776. Your {total_events} commitments are staging a tyrannical rule over your free time. But remember - every great revolution starts with recognizing the problem. It's time to channel your inner revolutionary spirit and fight for your right to free time. Life, liberty, and the pursuit of happiness - not endless back-to-back meetings!"
        
        # Calculate realistic stats
        avg_duration = total_hours / max(total_events, 1)
        longest_gap = "2-3 hours" if freedom_percentage > 60 else "1-2 hours" if freedom_percentage > 30 else "30-60 minutes"
        
        # Generate recommendations based on freedom level
        recommendations = []
        if freedom_percentage < 40:
            recommendations = [
                "Audit your commitments like the Continental Congress - question everything",
                "Create 'Constitutional Hours' - time blocks that are sacred and unschedulable",
                "Practice the Boston Tea Party approach - dump unnecessary commitments",
                "Establish a personal Bill of Rights that includes the right to free time",
                "Build buffer zones between commitments to prevent schedule tyranny"
            ]
        elif freedom_percentage < 70:
            recommendations = [
                "Batch similar activities for efficiency like organizing a constitutional convention",
                "Block out 'pursuit of happiness' time for hobbies and personal interests",
                "Delegate tasks using the Jefferson method - empower others to help",
                "Create consistent 'independence hours' for uninterrupted personal time",
                "Practice strategic 'no' like ratifying amendments - carefully but decisively"
            ]
        else:
            recommendations = [
                "You're doing excellent! Keep protecting your time freedom",
                "Share your schedule wisdom like a founding father sharing liberty principles",
                "Use your abundant free time for meaningful relationships and pursuits",
                "Consider mentoring others in achieving their own time independence",
                "Keep vigilant about maintaining your boundaries like defending the Constitution"
            ]
        
        result = {
            "independence_percentage": int(freedom_percentage),
            "witty_message": witty_message,
            "detailed_analysis": analysis,
            "meeting_stats": {
                "total_meetings": total_events,
                "total_hours": f"{total_hours:.1f}",
                "avg_meeting_length": f"{avg_duration:.1f} hours" if avg_duration >= 1 else f"{int(avg_duration * 60)} minutes",
                "longest_meeting_free_block": longest_gap
            },
            "recommendations": recommendations[:5]  # Limit to 5 recommendations
        }

        return CalendarAnalysisResponse(**result)

    except Exception as e:
        logging.error(f"Error analyzing calendar: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()