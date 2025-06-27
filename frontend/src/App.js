import { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { HeroSection } from './components/ui/hero-section-dark';
import { ActivityTokens } from './components/ui/activity-tokens';
import { LibertyTrackerTerminal } from './components/ui/liberty-tracker-terminal';
import { FlickeringGrid } from './components/ui/flickering-grid';
import { CleanLoginSection } from './components/ui/clean-login';
import { Calendar, TrendingUp, BarChart3, Clock, Users, CheckCircle2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function App() {
  const [user, setUser] = useState(null);
  const [calendarData, setCalendarData] = useState("");
  const [timePeriod, setTimePeriod] = useState("this_week");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    
    // Check for OAuth callback with token
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get('auth');
    const authToken = urlParams.get('token');
    const userEmail = urlParams.get('user');
    const userName = urlParams.get('name');
    
    if (authStatus === 'success' && authToken && userEmail) {
      // Store token and user data from OAuth callback
      localStorage.setItem('access_token', authToken);
      localStorage.setItem('user_data', JSON.stringify({
        email: userEmail,
        name: userName,
        id: userEmail
      }));
      
      setUser({
        email: userEmail,
        name: userName,
        id: userEmail
      });
      
      // Clear URL params
      window.history.replaceState({}, '', window.location.pathname);
    } else if (authStatus === 'error') {
      setError('Google Calendar authorization failed. Please try again.');
    }
  }, []);

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      setLoading(true);
      setError("");
      
      const result = await axios.post(`${API}/auth/google`, {
        token: credentialResponse.credential
      });
      
      const { access_token, user: userData } = result.data;
      
      // Store token and user data
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user_data', JSON.stringify(userData));
      
      setUser(userData);
      
    } catch (err) {
      console.error("Google login error:", err);
      setError(err.response?.data?.detail || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginError = () => {
    console.error("Google login failed");
    setError("Google login failed. Please try again.");
  };

  const requestCalendarAccess = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await axios.get(`${API}/auth/google-calendar`);
      const { authorization_url } = response.data;
      
      // Redirect to Google OAuth
      window.location.href = authorization_url;
      
    } catch (err) {
      console.error("Calendar access error:", err);
      setError(err.response?.data?.detail || "Failed to request calendar access.");
      setLoading(false);
    }
  };

  const analyzeCalendarAuto = async () => {
    setLoading(true);
    setError("");
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        `${API}/analyze-calendar-auto?time_period=${timePeriod}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setAnalysis(response.data);
    } catch (err) {
      console.error("Auto analysis error:", err);
      if (err.response?.status === 401) {
        setError("Calendar access required. Please authorize Google Calendar access first.");
      } else {
        setError(err.response?.data?.detail || "Failed to analyze calendar. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const analyzeCalendarManual = async () => {
    if (!calendarData.trim()) {
      setError("Please paste your schedule data first!");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const response = await axios.post(`${API}/analyze-calendar`, {
        calendar_data: calendarData,
        time_period: timePeriod
      });
      
      setAnalysis(response.data);
    } catch (err) {
      console.error("Manual analysis error:", err);
      setError(err.response?.data?.detail || "Failed to analyze your freedom. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    setUser(null);
    setAnalysis(null);
    setCalendarData("");
    setError("");
    setShowManual(false);
  };

  const resetAnalysis = () => {
    setAnalysis(null);
    setCalendarData("");
    setError("");
  };

  const getFreedomColor = (percentage) => {
    if (percentage >= 70) return "text-green-600";
    if (percentage >= 40) return "text-amber-600";
    return "text-red-600";
  };

  const getFreedomGradient = (percentage) => {
    if (percentage >= 70) return "from-green-500 to-emerald-600";
    if (percentage >= 40) return "from-amber-500 to-orange-600";
    return "from-red-500 to-rose-600";
  };

  // Manual Analysis Mode - Check BEFORE user check
  if (showManual) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Redesigned Header with Interactive Liberty Tracker */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-2">
              <span className="text-2xl mr-2">🇺🇸</span>
              <p className="text-xl text-gray-700 font-semibold">
                Manual Analysis Mode
              </p>
              <span className="text-2xl ml-2">🎆</span>
            </div>
            
            {/* Interactive Liberty Tracker Component - No Gradient */}
            <div className="mb-4 group cursor-pointer">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 transition-all duration-300 group-hover:scale-105">
                <span className="group-hover:hidden">Liberty Tracker</span>
                <span className="hidden group-hover:inline">Freedom Calculator</span>
              </h1>
            </div>
            
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              Paste your schedule data to discover how much of your time is truly free
            </p>
            
            {/* Prominent Back Button - No Gradient */}
            <div>
              <button
                onClick={() => setShowManual(false)}
                className="text-2xl font-medium text-gray-900 hover:text-gray-700 hover:scale-105 transition-all duration-300 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                ← Back to Google Login
              </button>
            </div>
          </div>

          <ActivityTokens className="mb-12" />

          {!analysis ? (
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="mb-6">
                <label className="block text-gray-700 text-lg font-semibold mb-3">
                  📅 Time Period Analysis
                </label>
                <select 
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="today">Today</option>
                  <option value="this week">This Week</option>
                  <option value="this month">This Month</option>
                  <option value="recent days">Recent Days</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-lg font-semibold mb-3">
                  📋 Paste Your Schedule Data
                </label>
                <p className="text-gray-600 text-sm mb-3">
                  Copy and paste your calendar events to calculate your time freedom percentage.
                </p>
                <textarea
                  value={calendarData}
                  onChange={(e) => setCalendarData(e.target.value)}
                  placeholder="Paste your schedule here... 

Example:
9:00 AM - 10:00 AM: Team Meeting
10:00 AM - 11:30 AM: Project Review
2:00 PM - 3:00 PM: Client Call
3:30 PM - 4:30 PM: Planning Session
..."
                  className="w-full h-64 p-4 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {/* Square CTA Button with Fluid Gradient Effect */}
              <div className="flex justify-center">
                <button
                  onClick={analyzeCalendarManual}
                  disabled={loading || !calendarData.trim()}
                  className="w-full py-4 px-8 font-semibold rounded-2xl transition-all duration-500 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-50 shadow-lg border border-gray-200 text-white relative overflow-hidden group"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
                    backgroundSize: '200% 200%',
                    backgroundPosition: '0% 50%',
                    transition: 'background-position 0.5s ease, transform 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading && calendarData.trim()) {
                      e.target.style.backgroundPosition = '100% 50%';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundPosition = '0% 50%';
                  }}
                >
                  {/* Overlay gradient for hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                  
                  {/* Button content */}
                  <span className="relative z-10">
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                        Calculating Your Freedom...
                      </div>
                    ) : (
                      "Calculate My Time Freedom"
                    )}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            /* Results Display for Manual */
            <div className="space-y-8">
              {/* Freedom Score */}
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm text-center">
                <div className="flex items-center justify-center mb-6">
                  <span className="text-4xl mr-4">🎆</span>
                  <div className={`text-7xl font-bold bg-gradient-to-r ${getFreedomGradient(analysis.independence_percentage)} bg-clip-text text-transparent`}>
                    {analysis.independence_percentage}%
                  </div>
                  <span className="text-4xl ml-4">🎆</span>
                </div>
                <div className="text-2xl text-gray-900 font-semibold mb-4">
                  🗽 TIME FREEDOM 🗽
                </div>
                <div className="text-lg text-gray-600 max-w-2xl mx-auto">
                  {analysis.witty_message}
                </div>
              </div>

              {/* Stats and Recommendations */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                    Liberty Stats
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Commitments:</span>
                      <span className="text-gray-900 font-medium">{analysis.meeting_stats.total_meetings}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hours Occupied:</span>
                      <span className="text-gray-900 font-medium">{analysis.meeting_stats.total_hours}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Duration:</span>
                      <span className="text-gray-900 font-medium">{analysis.meeting_stats.avg_meeting_length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Longest Free Block:</span>
                      <span className="text-gray-900 font-medium">{analysis.meeting_stats.longest_meeting_free_block}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                    Freedom Strategies
                  </h3>
                  <ul className="space-y-3">
                    {analysis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Detailed Analysis */}
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">🎯 Your Freedom Declaration</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {analysis.detailed_analysis}
                </p>
              </div>

              {/* Action Button */}
              <div className="text-center">
                <button
                  onClick={resetAnalysis}
                  className="py-3 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  🎆 Analyze Another Period
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Landing Page/Login Screen
  if (!user) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <div className="min-h-screen bg-white">
          {/* Hero Section */}
          <HeroSection
            title="Welcome to Liberty Tracker"
            subtitle={{
              regular: "Life, Liberty, and the",
              gradient: "Pursuit of Free Time",
            }}
            description="Transform your calendar chaos into clarity. Connect your Google Calendar to discover how much of your time is truly free and take control of your schedule."
            ctaText="Get Started Free"
            ctaHref="#auth-section"
            terminalComponent={<LibertyTrackerTerminal />}
            gridOptions={{
              angle: 65,
              opacity: 0.3,
              cellSize: 50,
              lightLineColor: "#e5e7eb",
              darkLineColor: "#374151",
            }}
            className="pb-0"
          />

          {/* Activity Tokens Section - Integrated Design */}
          <section className="relative bg-white overflow-hidden py-16">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-10">
              <FlickeringGrid
                className="absolute inset-0 w-full h-full"
                squareSize={3}
                gridGap={8}
                color="#3b82f6"
                maxOpacity={0.3}
                flickerChance={0.1}
              />
            </div>

            <div className="max-w-6xl mx-auto px-4 relative z-20">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-4">
                  Track Your Daily <span className="section-gradient">Activities</span>
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Visualize how you spend your time across different activities and find opportunities for more freedom
                </p>
              </div>
              <ActivityTokens />
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20 bg-white">
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-4">
                  Why Choose <span className="choose-gradient">Liberty Tracker</span>?
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Powerful insights to help you reclaim your time and make better decisions about your schedule
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Calendar Analysis</h3>
                  <p className="text-gray-600">
                    Automatically analyze your Google Calendar to understand your time allocation and identify patterns
                  </p>
                </div>
                
                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Freedom Percentage</h3>
                  <p className="text-gray-600">
                    Get a clear metric of how much free time you actually have and track improvements over time
                  </p>
                </div>
                
                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Actionable Insights</h3>
                  <p className="text-gray-600">
                    Receive personalized recommendations to optimize your schedule and increase your time freedom
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Clean Login Section */}
          <div id="auth-section">
            <CleanLoginSection
              onGoogleLogin={handleGoogleLogin}
              onGoogleLoginError={handleGoogleLoginError}
              onManualToggle={() => setShowManual(true)}
              loading={loading}
              error={error}
            />
          </div>
        </div>
      </GoogleOAuthProvider>
    );
  }

  // Main App (User Logged In)
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-4xl mr-3">🇺🇸</span>
                <h1 className="text-3xl font-bold liberty-gradient">
                  Liberty Tracker
                </h1>
                <span className="text-4xl ml-3">🎆</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-gray-900 font-medium">{user.name}</p>
                  <p className="text-gray-500 text-sm">{user.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors border border-gray-300"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Your Google Calendar is connected! Let's calculate your time freedom and help you reclaim control of your schedule.
            </p>
          </div>

          <ActivityTokens className="mb-12" />

          {!analysis ? (
            /* Analysis Options */
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Automatic Analysis */}
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-6 h-6 text-blue-600 mr-3" />
                  Automatic Analysis
                </h3>
                <p className="text-gray-600 mb-6">
                  Automatically analyze your Google Calendar to calculate your time freedom percentage.
                </p>
                
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-3">
                    📅 Time Period
                  </label>
                  <select 
                    value={timePeriod}
                    onChange={(e) => setTimePeriod(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="today">Today</option>
                    <option value="this_week">This Week</option>
                    <option value="this_month">This Month</option>
                    <option value="recent_days">Recent Days</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={requestCalendarAccess}
                    className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    🎯 Authorize Google Calendar
                  </button>
                  
                  <button
                    onClick={analyzeCalendarAuto}
                    disabled={loading}
                    className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                        Calculating...
                      </div>
                    ) : (
                      "🗽 Calculate My Freedom"
                    )}
                  </button>
                </div>
              </div>

              {/* Manual Analysis */}
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-6 h-6 text-purple-600 mr-3" />
                  Manual Analysis
                </h3>
                <p className="text-gray-600 mb-6">
                  Paste your schedule data manually for freedom calculation.
                </p>
                
                <div className="mb-4">
                  <textarea
                    value={calendarData}
                    onChange={(e) => setCalendarData(e.target.value)}
                    placeholder="Paste your schedule here...

Example:
9:00 AM - 10:00 AM: Team Meeting
10:00 AM - 11:30 AM: Project Review
..."
                    className="w-full h-32 p-4 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none text-sm"
                  />
                </div>

                <button
                  onClick={analyzeCalendarManual}
                  disabled={loading || !calendarData.trim()}
                  className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                      Analyzing...
                    </div>
                  ) : (
                    "🎆 Analyze Manual Data"
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Results Display */
            <div className="space-y-8">
              {/* Freedom Score */}
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm text-center">
                <div className="flex items-center justify-center mb-6">
                  <span className="text-4xl mr-4">🎆</span>
                  <div className={`text-7xl font-bold bg-gradient-to-r ${getFreedomGradient(analysis.independence_percentage)} bg-clip-text text-transparent`}>
                    {analysis.independence_percentage}%
                  </div>
                  <span className="text-4xl ml-4">🎆</span>
                </div>
                <div className="text-2xl text-gray-900 font-semibold mb-4">
                  🗽 TIME FREEDOM 🗽
                </div>
                <div className="text-lg text-gray-600 max-w-2xl mx-auto">
                  {analysis.witty_message}
                </div>
              </div>

              {/* Stats and Recommendations */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                    Liberty Stats
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Commitments:</span>
                      <span className="text-gray-900 font-medium">{analysis.meeting_stats.total_meetings}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hours Occupied:</span>
                      <span className="text-gray-900 font-medium">{analysis.meeting_stats.total_hours}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Duration:</span>
                      <span className="text-gray-900 font-medium">{analysis.meeting_stats.avg_meeting_length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Longest Free Block:</span>
                      <span className="text-gray-900 font-medium">{analysis.meeting_stats.longest_meeting_free_block}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                    Freedom Strategies
                  </h3>
                  <ul className="space-y-3">
                    {analysis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Detailed Analysis */}
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">🎯 Your Freedom Declaration</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {analysis.detailed_analysis}
                </p>
              </div>

              {/* Action Button */}
              <div className="text-center">
                <button
                  onClick={resetAnalysis}
                  className="py-3 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  🎆 Analyze Another Period
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg max-w-2xl mx-auto">
              <p className="text-red-700 text-center">{error}</p>
            </div>
          )}
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;