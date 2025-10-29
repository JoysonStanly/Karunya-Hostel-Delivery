import React from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/Button'
import Navbar from '../components/Navbar'
import { Package2, Clock, Users, MapPin, Shield, Zap, FileText } from 'lucide-react'

export default function Landing(){
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      
      {/* Hero Section */}
      <div className="flex-1 px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left Content */}
            <div className="space-y-8">
              <h1 className="text-5xl font-bold text-gray-900 dark:text-white lg:text-6xl">
                Your Hostel,
                <span className="block text-blue-600 dark:text-blue-400">Delivered.</span>
              </h1>
              <p className="text-xl leading-relaxed text-gray-600 dark:text-gray-300">
                Connecting students for seamless parcel and food 
                delivery within hostel campuses. Fast, reliable, and 
                secure.
              </p>
              <div className="flex gap-4">
                <Link to="/login">
                  <Button size="lg" className="px-8 py-4 text-lg">
                    Get Started
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Right Image/Illustration */}
            <div className="relative">
              <div className="flex items-center justify-center p-8 bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-3xl h-96">
                <div className="text-center">
                  <Package2 size={120} className="mx-auto mb-4 text-blue-600 dark:text-blue-400" />
                  <p className="text-lg font-semibold text-blue-800 dark:text-blue-300">Hostel Delivery Service</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 bg-gray-50 dark:bg-slate-900">
        <div className="px-4 mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
              How Karunya Hostel Delivery Works
            </h2>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
                <Zap className="text-blue-600 dark:text-blue-400" size={40} />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">Quick & Efficient</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Place orders and get them delivered quickly within the hostel campus with real-time tracking.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="text-center">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 rounded-2xl">
                <Users className="text-green-600 dark:text-green-400" size={40} />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">Community Powered</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Fellow students deliver your packages, creating a trusted community-based delivery network.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="text-center">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-purple-100 dark:bg-purple-900/30 rounded-2xl">
                <MapPin className="text-purple-600 dark:text-purple-400" size={40} />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">Real-time Tracking</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Track your orders in real-time and get notifications at every step of the delivery process.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Features Section */}
      <div className="py-20">
        <div className="px-4 mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature 4 */}
            <div className="text-center">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-orange-100 dark:bg-orange-900/30 rounded-2xl">
                <Shield className="text-orange-600 dark:text-orange-400" size={40} />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">Trustworthy Service</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Verified student delivery partners ensure safe and secure delivery of your packages.
              </p>
            </div>
            
            {/* Feature 5 */}
            <div className="text-center">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-2xl">
                <Clock className="text-red-600 dark:text-red-400" size={40} />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">On-Demand & Scheduled</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get instant deliveries or schedule them for later according to your convenience.
              </p>
            </div>
            
            {/* Feature 6 */}
            <div className="text-center">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl">
                <FileText className="text-indigo-600 dark:text-indigo-400" size={40} />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">Student-Friendly Costs</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Affordable delivery charges designed specifically for students' budget constraints.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-blue-600 dark:bg-blue-900">
        <div className="max-w-4xl px-4 mx-auto text-center">
          <h2 className="mb-4 text-3xl font-bold text-white lg:text-4xl">
            Ready to get started?
          </h2>
          <p className="mb-8 text-xl text-blue-100 dark:text-blue-200">
            Join thousands of students already using our delivery service.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link to="/login">
              <Button size="lg" className="px-8 py-4 text-lg text-blue-600 bg-white hover:bg-gray-50 dark:bg-white dark:hover:bg-gray-100">
                Login/Register Account
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg text-white border-white hover:bg-white hover:text-blue-600 dark:hover:text-blue-900">
                Become a Delivery Partner
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 text-white bg-gray-900 dark:bg-slate-950 border-t dark:border-slate-800">
        <div className="px-4 mx-auto text-center max-w-7xl">
          <div className="flex items-center justify-center mb-4">
            <Package2 size={24} className="mr-2" />
            <span className="text-xl font-semibold">Karunya Hostel Delivery</span>
          </div>
          <p className="text-gray-400 dark:text-gray-500">
            © 2025 Karunya Hostel Delivery. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
