'use client'

import { useState, useEffect } from 'react'
import { Calculator, IndianRupee, Calendar, Percent, PieChart, TrendingUp, Home, Building2 } from 'lucide-react'

export default function EMICalculatorPage() {
  const [loanAmount, setLoanAmount] = useState(5000000) // 50 Lakhs
  const [interestRate, setInterestRate] = useState(8.5)
  const [loanTenure, setLoanTenure] = useState(20) // years
  const [emi, setEmi] = useState(0)
  const [totalInterest, setTotalInterest] = useState(0)
  const [totalPayment, setTotalPayment] = useState(0)

  useEffect(() => {
    calculateEMI()
  }, [loanAmount, interestRate, loanTenure])

  const calculateEMI = () => {
    const principal = loanAmount
    const rate = interestRate / 12 / 100
    const time = loanTenure * 12

    if (rate === 0) {
      const monthlyEmi = principal / time
      setEmi(monthlyEmi)
      setTotalPayment(principal)
      setTotalInterest(0)
      return
    }

    const emiValue = (principal * rate * Math.pow(1 + rate, time)) / (Math.pow(1 + rate, time) - 1)
    const totalPaymentValue = emiValue * time
    const totalInterestValue = totalPaymentValue - principal

    setEmi(emiValue)
    setTotalPayment(totalPaymentValue)
    setTotalInterest(totalInterestValue)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatLakhs = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`
    }
    return `₹${(value / 100000).toFixed(2)} L`
  }

  // Calculate percentages for pie chart
  const principalPercent = (loanAmount / totalPayment) * 100
  const interestPercent = (totalInterest / totalPayment) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Hero Section */}
      <div className="hero-gradient text-white py-16">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Calculator className="w-5 h-5" />
              <span className="font-medium">EMI Calculator</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Home Loan EMI Calculator
            </h1>
            <p className="text-xl text-white/90">
              Plan your dream home in Lucknow with our easy EMI calculator
            </p>
            <p className="text-white/70 mt-2">
              Gomti Nagar se Hazratganj tak - apne budget mein ghar dhundho! 🏠
            </p>
          </div>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Calculator Input Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-estato rounded-xl flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                Calculate Your EMI
              </h2>

              {/* Loan Amount */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-primary-600" />
                    Loan Amount
                  </label>
                  <span className="text-lg font-bold text-primary-600">{formatLakhs(loanAmount)}</span>
                </div>
                <input
                  type="range"
                  min="500000"
                  max="50000000"
                  step="100000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>₹5 L</span>
                  <span>₹5 Cr</span>
                </div>
              </div>

              {/* Interest Rate */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Percent className="w-4 h-4 text-secondary-500" />
                    Interest Rate (p.a.)
                  </label>
                  <span className="text-lg font-bold text-secondary-500">{interestRate}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="20"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-secondary-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5%</span>
                  <span>20%</span>
                </div>
              </div>

              {/* Loan Tenure */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-accent-500" />
                    Loan Tenure
                  </label>
                  <span className="text-lg font-bold text-accent-500">{loanTenure} Years</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={loanTenure}
                  onChange={(e) => setLoanTenure(Number(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 Year</span>
                  <span>30 Years</span>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="border-t border-gray-100 pt-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">Quick Presets:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: '₹25L / 15Y', amount: 2500000, tenure: 15 },
                    { label: '₹50L / 20Y', amount: 5000000, tenure: 20 },
                    { label: '₹1Cr / 25Y', amount: 10000000, tenure: 25 },
                    { label: '₹2Cr / 30Y', amount: 20000000, tenure: 30 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        setLoanAmount(preset.amount)
                        setLoanTenure(preset.tenure)
                      }}
                      className="px-4 py-2 text-sm font-medium rounded-lg border-2 border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-all"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              {/* EMI Result Card */}
              <div className="bg-gradient-estato rounded-2xl shadow-xl p-8 text-white">
                <div className="text-center">
                  <p className="text-white/80 mb-2">Your Monthly EMI</p>
                  <p className="text-5xl font-bold mb-4">{formatCurrency(emi)}</p>
                  <p className="text-white/70 text-sm">per month for {loanTenure} years</p>
                </div>
              </div>

              {/* Breakdown Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <IndianRupee className="w-5 h-5 text-primary-600" />
                    </div>
                    <span className="text-sm text-gray-600">Principal</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{formatLakhs(loanAmount)}</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-secondary-600" />
                    </div>
                    <span className="text-sm text-gray-600">Total Interest</span>
                  </div>
                  <p className="text-2xl font-bold text-secondary-600">{formatLakhs(totalInterest)}</p>
                </div>
              </div>

              {/* Total Payment */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                      <PieChart className="w-5 h-5 text-accent-600" />
                    </div>
                    <span className="text-sm text-gray-600">Total Payment</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{formatLakhs(totalPayment)}</p>
                </div>
                
                {/* Visual Breakdown Bar */}
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-primary-600 transition-all duration-500"
                    style={{ width: `${principalPercent}%` }}
                  />
                  <div 
                    className="bg-secondary-500 transition-all duration-500"
                    style={{ width: `${interestPercent}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-primary-600 rounded-full"></span>
                    Principal ({principalPercent.toFixed(1)}%)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-secondary-500 rounded-full"></span>
                    Interest ({interestPercent.toFixed(1)}%)
                  </span>
                </div>
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6 border border-primary-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center">
                    <Home className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Ready to find your dream home?</p>
                    <p className="text-sm text-gray-600">Browse properties in Lucknow within your budget</p>
                  </div>
                </div>
                <a 
                  href={`/properties?maxPrice=${loanAmount}`}
                  className="mt-4 w-full btn-gradient block text-center"
                >
                  Browse Properties under {formatLakhs(loanAmount)}
                </a>
              </div>
            </div>
          </div>

          {/* Lucknow Areas Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Popular Areas in Lucknow 📍
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { name: 'Gomti Nagar', emoji: '🏢', avgPrice: '80L - 2Cr' },
                { name: 'Hazratganj', emoji: '🛍️', avgPrice: '1Cr - 3Cr' },
                { name: 'Aliganj', emoji: '🏠', avgPrice: '50L - 1.5Cr' },
                { name: 'Indira Nagar', emoji: '🌳', avgPrice: '60L - 1.8Cr' },
                { name: 'Mahanagar', emoji: '🏘️', avgPrice: '70L - 2Cr' },
                { name: 'Jankipuram', emoji: '🏡', avgPrice: '40L - 1Cr' },
              ].map((area) => (
                <a
                  key={area.name}
                  href={`/properties?area=${area.name}`}
                  className="bg-white rounded-xl p-4 shadow-md hover:shadow-xl transition-all border border-gray-100 hover:border-primary-200 group"
                >
                  <div className="text-2xl mb-2">{area.emoji}</div>
                  <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{area.name}</p>
                  <p className="text-xs text-gray-500">{area.avgPrice}</p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
