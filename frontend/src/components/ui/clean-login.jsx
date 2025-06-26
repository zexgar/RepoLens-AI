import { useState } from "react"
import { Button } from "./button"
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"
import { cn } from "../../lib/utils"
import { GoogleLogin } from '@react-oauth/google'

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

  return (
    <section className={cn("py-20 bg-gray-50", className)}>
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
          {/* Header with updated layout */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <span className="text-2xl mr-2">🇺🇸</span>
              <h1 className="text-2xl font-medium liberty-gradient">
                Liberty Tracker
              </h1>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Welcome Back!
            </h2>
            <p className="text-gray-600">
              We missed you! Please enter your details.
            </p>
          </div>

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
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
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

            {/* Flowing Gradient Sign In Button */}
            <button
              type="button"
              disabled={loading}
              className="w-full relative overflow-hidden rounded-lg py-3 px-4 font-semibold text-white transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flowing-gradient-button"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-white via-blue-600 to-red-600 bg-[length:300%_100%] animate-gradient-flow"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-blue-600 opacity-90"></div>
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
    </section>
  )
}

export { CleanLoginSection }