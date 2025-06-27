import { useState, useEffect } from "react"
import { Button } from "./button"
import { Eye, EyeOff, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "../../lib/utils"
import { GoogleLogin } from '@react-oauth/google'
import { MagicCard } from "./magic-card"

function CleanLoginSection({ 
  onGoogleLogin, 
  onGoogleLoginError, 
  onManualToggle, 
  loading, 
  error, 
  className 
}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Slideshow images of people with good habits
  const slides = [
    {
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop",
      title: "Morning Routine",
      description: "Start your day with intention and clarity"
    },
    {
      image: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=600&h=400&fit=crop",
      title: "Focused Work",
      description: "Deep work sessions for maximum productivity"
    },
    {
      image: "https://images.unsplash.com/photo-1506629905607-ce91fd63c4d4?w=600&h=400&fit=crop",
      title: "Time Management",
      description: "Organize your schedule for better work-life balance"
    },
    {
      image: "https://images.unsplash.com/photo-1594736797933-d0b22d34bbc8?w=600&h=400&fit=crop",
      title: "Mindful Planning",
      description: "Strategic thinking leads to time freedom"
    },
    {
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop",
      title: "Team Collaboration",
      description: "Efficient meetings and productive teamwork"
    }
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(nextSlide, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className={cn("py-20 bg-gray-50", className)}>
      <div className="w-full max-w-7xl mx-auto px-4">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="liberty-tracker-header mb-6">
            <span className="text-4xl mr-3">🇺🇸</span>
            <h1 className="text-4xl font-medium liberty-tracker-enhanced">
              Liberty Tracker
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your time into freedom. Connect and start your journey to better work-life balance.
          </p>
        </div>

        {/* Split Layout Container */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="grid lg:grid-cols-2">
            
            {/* Left Side - Login Form */}
            <div className="p-8 lg:p-12">
              <div className="max-w-md mx-auto">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Welcome Back!
                </h2>
                <p className="text-gray-600 mb-8">
                  We missed you! Please enter your details.
                </p>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <form className="space-y-6">
                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your Email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter Password"
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">Remember me</span>
                    </label>
                    <button
                      type="button"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Enhanced Flowing Gradient Sign In Button */}
                  <button
                    type="button"
                    disabled={loading}
                    className="w-full relative overflow-hidden rounded-lg py-4 px-4 font-semibold text-white transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed enhanced-flowing-gradient-button"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-white via-blue-600 to-red-600 bg-[length:300%_100%]"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-blue-700 opacity-90"></div>
                    <span className="relative z-10 flex items-center justify-center">
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                          Signing in...
                        </>
                      ) : (
                        "Sign in"
                      )}
                    </span>
                  </button>
                </form>

                {/* Google Sign In */}
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">or</span>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-center">
                    <GoogleLogin
                      onSuccess={onGoogleLogin}
                      onError={onGoogleLoginError}
                      theme="outline"
                      size="large"
                      text="signin_with"
                      shape="rectangular"
                      logo_alignment="left"
                    />
                  </div>
                </div>

                {/* Sign Up Link */}
                <div className="text-center mt-8 pt-6 border-t border-gray-200">
                  <p className="text-gray-600">
                    Don't have an account?{" "}
                    <button
                      onClick={onManualToggle}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Try manual analysis
                    </button>
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Full-Width Slideshow */}
            <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 lg:min-h-[600px] flex items-center justify-center p-0">
              {/* Slideshow Container - Full Width */}
              <div className="relative w-full h-full">
                <div className="relative h-full overflow-hidden">
                  <div 
                    className="flex transition-transform duration-500 ease-in-out h-full"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {slides.map((slide, index) => (
                      <div key={index} className="min-w-full h-full relative">
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        <div className="absolute bottom-8 left-8 right-8 text-white">
                          <h3 className="text-2xl font-bold mb-2">{slide.title}</h3>
                          <p className="text-gray-200">{slide.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Navigation Arrows */}
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors backdrop-blur-sm z-10"
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors backdrop-blur-sm z-10"
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>

                  {/* Slide Indicators */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                    {slides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={cn(
                          "w-3 h-3 rounded-full transition-colors",
                          currentSlide === index ? "bg-white" : "bg-white/50"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export { CleanLoginSection }