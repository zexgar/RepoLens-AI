import { useState } from "react"
import { Button } from "./button"
import { Badge } from "./badge"
import { ArrowRightIcon, CheckIcon } from "@radix-ui/react-icons"
import { Calendar, Zap, Clock, BarChart3 } from "lucide-react"
import { cn } from "../../lib/utils"
import { GoogleLogin } from '@react-oauth/google'

function InteractiveLoginSection({ 
  onGoogleLogin, 
  onGoogleLoginError, 
  onManualToggle, 
  loading, 
  error, 
  className 
}) {
  const [selectedMethod, setSelectedMethod] = useState("automatic")

  const loginMethods = [
    {
      id: "automatic",
      name: "Google Calendar",
      description: "Connect your calendar for automatic analysis",
      highlight: true,
      badge: "Recommended",
      icon: (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl rounded-full" />
          <Calendar className="w-7 h-7 relative z-10 text-blue-600 animate-pulse" />
        </div>
      ),
      features: [
        {
          name: "Real-time Analysis",
          description: "Instant freedom percentage calculation",
          included: true,
        },
        {
          name: "Smart Recommendations",
          description: "AI-powered schedule optimization",
          included: true,
        },
        {
          name: "Secure Connection",
          description: "OAuth 2.0 protected calendar access",
          included: true,
        },
        {
          name: "Historical Tracking",
          description: "Track your progress over time",
          included: true,
        },
      ],
    },
    {
      id: "manual",
      name: "Manual Entry",
      description: "Paste your schedule for quick analysis",
      highlight: false,
      icon: (
        <div className="relative">
          <Clock className="w-7 h-7 relative z-10 text-gray-600" />
        </div>
      ),
      features: [
        {
          name: "Quick Setup",
          description: "No account connection required",
          included: true,
        },
        {
          name: "Privacy First",
          description: "Your data stays local",
          included: true,
        },
        {
          name: "Instant Results",
          description: "Immediate freedom analysis",
          included: true,
        },
        {
          name: "Limited Features",
          description: "Basic analysis only",
          included: false,
        },
      ],
    },
  ]

  const buttonStyles = {
    default: cn(
      "h-12 bg-white",
      "hover:bg-gray-50",
      "text-gray-900",
      "border border-gray-200",
      "hover:border-gray-300",
      "shadow-sm hover:shadow-md",
      "text-sm font-medium",
    ),
    highlight: cn(
      "h-12 bg-gradient-to-r from-blue-600 to-purple-600",
      "hover:from-blue-700 hover:to-purple-700",
      "text-white",
      "shadow-[0_4px_15px_rgba(59,130,246,0.3)]",
      "hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)]",
      "font-semibold text-base",
    ),
  }

  const badgeStyles = cn(
    "px-4 py-1.5 text-sm font-medium",
    "bg-gradient-to-r from-blue-600 to-purple-600",
    "text-white",
    "border-none shadow-lg",
  )

  return (
    <section className={cn("py-20 bg-gray-50", className)}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <span className="text-4xl mr-2">🇺🇸</span>
            <h2 className="text-3xl font-medium liberty-gradient">
              Liberty Tracker
            </h2>
            <span className="text-4xl ml-2">🎆</span>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect your Google Calendar to start analyzing your time freedom
          </p>
          
          <div className="inline-flex items-center p-1.5 bg-white rounded-full border border-gray-200 shadow-sm mt-6">
            {loginMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={cn(
                  "px-8 py-2.5 text-sm font-medium rounded-full transition-all duration-300",
                  selectedMethod === method.id
                    ? "bg-gray-900 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900",
                )}
              >
                {method.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {loginMethods.map((method) => (
            <div
              key={method.id}
              className={cn(
                "relative group backdrop-blur-sm",
                "rounded-3xl transition-all duration-300",
                "flex flex-col",
                selectedMethod === method.id
                  ? "ring-2 ring-blue-500 ring-offset-2 transform scale-105"
                  : "",
                method.highlight
                  ? "bg-gradient-to-b from-blue-50/80 to-transparent"
                  : "bg-white",
                "border",
                method.highlight
                  ? "border-blue-200 shadow-xl"
                  : "border-gray-200 shadow-md",
                "hover:shadow-lg cursor-pointer",
              )}
              onClick={() => setSelectedMethod(method.id)}
            >
              {method.badge && method.highlight && (
                <div className="absolute -top-4 left-6">
                  <Badge className={badgeStyles}>{method.badge}</Badge>
                </div>
              )}

              <div className="p-8 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={cn(
                      "p-3 rounded-xl",
                      method.highlight
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-600",
                    )}
                  >
                    {method.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {method.name}
                  </h3>
                </div>

                <div className="mb-6">
                  <p className="text-gray-600">
                    {method.description}
                  </p>
                </div>

                <div className="space-y-4">
                  {method.features.map((feature) => (
                    <div key={feature.name} className="flex gap-4">
                      <div
                        className={cn(
                          "mt-1 p-0.5 rounded-full transition-colors duration-200",
                          feature.included
                            ? "text-green-600"
                            : "text-gray-400",
                        )}
                      >
                        <CheckIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {feature.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {feature.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 pt-0">
                {method.id === "automatic" ? (
                  <div className="space-y-4">
                    {error && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-sm">{error}</p>
                      </div>
                    )}
                    
                    <div className="flex justify-center">
                      <GoogleLogin
                        onSuccess={onGoogleLogin}
                        onError={onGoogleLoginError}
                        theme="filled_blue"
                        size="large"
                        text="signin_with"
                        shape="rectangular"
                        logo_alignment="left"
                      />
                    </div>
                    
                    {loading && (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent mr-3"></div>
                        <span className="text-gray-600 text-sm">Signing in...</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <Button
                    onClick={onManualToggle}
                    className={cn(
                      "w-full relative transition-all duration-300",
                      selectedMethod === method.id
                        ? buttonStyles.highlight
                        : buttonStyles.default,
                    )}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Try Manual Analysis
                      <ArrowRightIcon className="w-4 h-4" />
                    </span>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export { InteractiveLoginSection }