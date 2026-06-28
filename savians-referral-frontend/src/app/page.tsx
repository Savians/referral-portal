'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle, DollarSign, Users, TrendingUp } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import ThemeToggle from '@/components/ThemeToggle';

/**
 * Landing Page
 * 
 * Public homepage explaining the referral program
 */

export default function HomePage() {
  const { user, isLoading } = useAuth();

  // Determine dashboard route based on user role
  const getDashboardRoute = () => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'PARTNER':
        return '/partner/dashboard';
      case 'ADMIN':
        return '/admin/dashboard';
      case 'SUPER_ADMIN':
        return '/admin/dashboard'; // SuperAdmin starts at Admin dashboard, can toggle to SuperAdmin
      default:
        return '/';
    }
  };
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <a href="https://savians.com" className="flex items-center hover:opacity-90 transition-opacity">
              <img 
                src="/savians-logo.png" 
                alt="Savians Logo" 
                className="h-12 w-auto"
              />
            </a>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-savians-navy dark:hover:text-white transition-colors font-medium">
                Home
              </Link>
              <Link href="/apply" className="text-gray-700 dark:text-gray-300 hover:text-savians-navy dark:hover:text-white transition-colors font-medium">
                Become a Referral Partner
              </Link>
              <ThemeToggle />
              {!isLoading && (
                user ? (
                  <Link href={getDashboardRoute()} className="btn-outline text-sm">
                    Dashboard
                  </Link>
                ) : (
                  <Link href="/login" className="btn-outline text-sm">
                    Sign In
                  </Link>
                )
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-savians-navy to-savians-navy-light dark:from-gray-800 dark:to-gray-900 text-white py-24 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-savians-yellow/10 dark:bg-yellow-500/10 text-savians-yellow dark:text-yellow-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
                Elite Tax Strategy
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Tired of Paying too Much in Taxes?
                <span className="text-savians-yellow dark:text-yellow-400"> You should be.</span>
              </h1>
              <p className="text-xl text-gray-300 dark:text-gray-400 mb-8">
                We Turn Tax Problems Into Wealth Solutions.
              </p>
              <p className="text-gray-300 dark:text-gray-400 mb-8">
                With the right strategy, your tax bill can be minimized — without compromising your success.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/apply" className="btn-secondary inline-flex items-center justify-center gap-2">
                  Become a Referral Partner
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button className="bg-white/10 hover:bg-white/20 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-medium rounded-lg px-6 py-3 transition-colors">
                  Learn More
                </button>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-white/20 dark:border-gray-700">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-savians-yellow dark:text-yellow-400">
                    <CheckCircle className="w-6 h-6" />
                    <span>Tax Savings 70%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6" />
                    <span>IRS Compliant 100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-semibold text-savians-yellow dark:text-yellow-400 uppercase tracking-wide mb-3">
              Why us?
            </h2>
            <h3 className="text-4xl font-bold text-savians-navy dark:text-white mb-4">
              Smarter Tax Strategies. Stronger Wealth.
            </h3>
            <h3 className="text-4xl font-bold text-savians-navy dark:text-white mb-4">
              Complete Compliance.
            </h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Users,
                title: 'Trusted Tax Expertise',
                description: 'Years of proven success helping high-income clients legally reduce tax burdens.',
              },
              {
                icon: TrendingUp,
                title: 'Personalized Planning Approach',
                description: 'No cookie-cutter plans — just tailored strategies for your unique financial goals.',
              },
              {
                icon: CheckCircle,
                title: 'IRS-Compliant Solutions',
                description: 'Every method we use follows official IRS guidelines for full legal protection.',
              },
              {
                icon: DollarSign,
                title: 'Maximum Savings Focus',
                description: 'We uncover every deduction and credit you\'re entitled to - nothing left behind.',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm hover:shadow-md dark:shadow-gray-900/50 transition-shadow"
              >
                <div className="w-12 h-12 bg-savians-yellow/10 dark:bg-yellow-500/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-savians-navy dark:text-yellow-400" />
                </div>
                <h4 className="text-lg font-semibold text-savians-navy dark:text-white mb-2">
                  {feature.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Program Section */}
      <section className="py-20 bg-white dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-savians-navy dark:text-white mb-6">
                Benefits of Becoming a Savians Referral Partner
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-savians-yellow dark:text-yellow-400 font-bold flex-shrink-0">•</span>
                  <p className="text-gray-700 dark:text-gray-300">
                    Help your network access proactive, year-round tax planning.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-savians-yellow dark:text-yellow-400 font-bold flex-shrink-0">•</span>
                  <p className="text-gray-700 dark:text-gray-300">
                    Be the reason your referral may discover meaningful, legally supported tax savings they did not know were available.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-savians-yellow dark:text-yellow-400 font-bold flex-shrink-0">•</span>
                  <p className="text-gray-700 dark:text-gray-300">
                    Refer high-income earners, business owners, real estate investors, and professionals who may be paying more taxes than necessary.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-savians-yellow dark:text-yellow-400 font-bold flex-shrink-0">•</span>
                  <p className="text-gray-700 dark:text-gray-300">
                    Create value for your referrals by connecting them with a tax advisory team focused on legal tax-saving strategies.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-savians-yellow dark:text-yellow-400 font-bold flex-shrink-0">•</span>
                  <p className="text-gray-700 dark:text-gray-300">
                    Help your referrals move beyond basic tax filing and start planning before the tax year is over.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-savians-yellow dark:text-yellow-400 font-bold flex-shrink-0">•</span>
                  <p className="text-gray-700 dark:text-gray-300">
                    Earn referral rewards for qualified clients who enroll in the Savians Tax Assessment Program.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-savians-yellow dark:text-yellow-400 font-bold flex-shrink-0">•</span>
                  <p className="text-gray-700 dark:text-gray-300">
                    Earn $500, $600, or $700 per qualified referral based on your referral tier.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-savians-yellow dark:text-yellow-400 font-bold flex-shrink-0">•</span>
                  <p className="text-gray-700 dark:text-gray-300">
                    Receive an additional $1,000 annual bonus when you reach 10 qualified referrals in a calendar year.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-savians-yellow dark:text-yellow-400 font-bold flex-shrink-0">•</span>
                  <p className="text-gray-700 dark:text-gray-300">
                    No tax expertise or selling is required from you.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-savians-yellow dark:text-yellow-400 font-bold flex-shrink-0">•</span>
                  <p className="text-gray-700 dark:text-gray-300">
                    Savians handles the client assessment, advisory process, and tax strategy review.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-savians-yellow dark:text-yellow-400 font-bold flex-shrink-0">•</span>
                  <p className="text-gray-700 dark:text-gray-300">
                    Build stronger relationships by offering a high-value referral to people who need better tax planning.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-savians-yellow dark:text-yellow-400 font-bold flex-shrink-0">•</span>
                  <p className="text-gray-700 dark:text-gray-300">
                    Create an additional income opportunity through trusted introductions.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-savians-yellow dark:text-yellow-400 font-bold flex-shrink-0">•</span>
                  <p className="text-gray-700 dark:text-gray-300">
                    Partner with a professional tax advisory brand focused on compliance, strategy, and client value.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 transition-colors">
              <h4 className="text-2xl font-bold text-savians-navy dark:text-white mb-6">
                Join Our Referral Partner Program
              </h4>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-savians-yellow dark:bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-savians-navy dark:text-gray-900 text-sm font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-savians-navy dark:text-white">Apply to Become a Partner</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Quick and easy application process</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-savians-yellow dark:bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-savians-navy dark:text-gray-900 text-sm font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-semibold text-savians-navy dark:text-white">Get Your Unique Referral Link</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Share with your network</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-savians-yellow dark:bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-savians-navy dark:text-gray-900 text-sm font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-semibold text-savians-navy dark:text-white">Earn Commission on Referrals</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Track and manage all referrals in your portal</p>
                  </div>
                </li>
              </ul>
              <Link href="/apply" className="btn-primary w-full inline-flex items-center justify-center gap-2">
                Apply Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-savians-navy dark:bg-gray-800 text-white transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to save big on taxes?
          </h2>
          <p className="text-xl text-gray-300 dark:text-gray-400 mb-8">
            Book Your Tax Advisory Consultation Today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-secondary inline-flex items-center justify-center gap-2">
              Schedule a Consultation
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link href="/apply" className="bg-white/10 hover:bg-white/20 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-medium rounded-lg px-8 py-3 transition-colors">
              Become a Referral Partner
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-savians-yellow dark:bg-yellow-500 rounded-lg flex items-center justify-center">
                  <span className="text-savians-navy dark:text-gray-900 text-lg font-bold">S</span>
                </div>
                <span className="text-xl font-bold text-savians-navy dark:text-white">Savians</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Savians provides elite, IRS compliant tax strategies tailored for high income earners, business owners, and investors.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-savians-navy dark:text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-savians-navy dark:hover:text-white">About Us</Link></li>
                <li><Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-savians-navy dark:hover:text-white">Plans and Pricing</Link></li>
                <li><Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-savians-navy dark:hover:text-white">Services</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-savians-navy dark:text-white mb-4">Address</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                14520 Old Katy Rd # 136<br />
                Houston, TX 77079
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                +1(346) 662-0574
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-savians-navy dark:text-white mb-4">Partner Portal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/login" className="text-gray-600 dark:text-gray-400 hover:text-savians-navy dark:hover:text-white">Sign In</Link></li>
                <li><Link href="/apply" className="text-gray-600 dark:text-gray-400 hover:text-savians-navy dark:hover:text-white">Become a Referral Partner</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>&copy; {new Date().getFullYear()} Savians. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
