import Link from 'next/link';
import { ArrowRight, CheckCircle, DollarSign, Users, TrendingUp } from 'lucide-react';

/**
 * Landing Page
 * 
 * Public homepage explaining the referral program
 */

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-savians-yellow rounded-lg flex items-center justify-center">
                <span className="text-savians-navy text-xl font-bold">S</span>
              </div>
              <span className="text-2xl font-bold text-savians-navy">Savians</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-gray-700 hover:text-savians-navy transition-colors">
                Home
              </Link>
              <Link href="/apply" className="text-gray-700 hover:text-savians-navy transition-colors">
                Become a Referral Partner
              </Link>
              <Link href="/login" className="btn-outline text-sm">
                Sign In
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-savians-navy to-savians-navy-light text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-savians-yellow/10 text-savians-yellow px-4 py-2 rounded-full text-sm font-medium mb-6">
                Elite Tax Strategy
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Tired of Paying too Much in Taxes?
                <span className="text-savians-yellow"> You should be.</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                We Turn Tax Problems Into Wealth Solutions.
              </p>
              <p className="text-gray-300 mb-8">
                With the right strategy, your tax bill can be minimized — without compromising your success.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/apply" className="btn-secondary inline-flex items-center justify-center gap-2">
                  Become a Referral Partner
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button className="bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg px-6 py-3 transition-colors">
                  Learn More
                </button>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-savians-yellow">
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
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-semibold text-savians-yellow uppercase tracking-wide mb-3">
              Why us?
            </h2>
            <h3 className="text-4xl font-bold text-savians-navy mb-4">
              Smarter Tax Strategies. Stronger Wealth.
            </h3>
            <h3 className="text-4xl font-bold text-savians-navy mb-4">
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
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-savians-yellow/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-savians-navy" />
                </div>
                <h4 className="text-lg font-semibold text-savians-navy mb-2">
                  {feature.title}
                </h4>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Program Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-sm font-semibold text-savians-yellow uppercase tracking-wide mb-3">
                Key Facts
              </h2>
              <h3 className="text-4xl font-bold text-savians-navy mb-6">
                Your Trusted Tax Strategy Partner.
              </h3>
              <p className="text-gray-600 mb-8">
                At Savians, we don't just file your taxes — we build long-term strategies to protect and grow your wealth. From personalized planning to proactive guidance, we ensure you pay less while staying 100% IRS-compliant.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-savians-yellow flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">
                    100% IRS-compliant, personalized tax planning
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-savians-yellow flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">
                    Expertise in business, real estate, and high-income strategies
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-savians-yellow flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">
                    Year-round guidance — not just during tax season
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8">
              <h4 className="text-2xl font-bold text-savians-navy mb-6">
                Join Our Referral Partner Program
              </h4>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-savians-yellow rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-savians-navy text-sm font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-savians-navy">Apply to Become a Partner</p>
                    <p className="text-sm text-gray-600">Quick and easy application process</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-savians-yellow rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-savians-navy text-sm font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-semibold text-savians-navy">Get Your Unique Referral Link</p>
                    <p className="text-sm text-gray-600">Share with your network</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-savians-yellow rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-savians-navy text-sm font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-semibold text-savians-navy">Earn Commission on Referrals</p>
                    <p className="text-sm text-gray-600">Track and manage all referrals in your portal</p>
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
      <section className="py-20 bg-savians-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to save big on taxes?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Book Your Tax Advisory Consultation Today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-secondary inline-flex items-center justify-center gap-2">
              Schedule a Consultation
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link href="/apply" className="bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg px-8 py-3 transition-colors">
              Become a Referral Partner
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-savians-yellow rounded-lg flex items-center justify-center">
                  <span className="text-savians-navy text-lg font-bold">S</span>
                </div>
                <span className="text-xl font-bold text-savians-navy">Savians</span>
              </div>
              <p className="text-sm text-gray-600">
                Savians provides elite, IRS compliant tax strategies tailored for high income earners, business owners, and investors.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-savians-navy mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="text-gray-600 hover:text-savians-navy">About Us</Link></li>
                <li><Link href="/" className="text-gray-600 hover:text-savians-navy">Plans and Pricing</Link></li>
                <li><Link href="/" className="text-gray-600 hover:text-savians-navy">Services</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-savians-navy mb-4">Address</h4>
              <p className="text-sm text-gray-600">
                14520 Old Katy Rd # 136<br />
                Houston, TX 77079
              </p>
              <p className="text-sm text-gray-600 mt-4">
                +1(346) 662-0574
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-savians-navy mb-4">Partner Portal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/login" className="text-gray-600 hover:text-savians-navy">Sign In</Link></li>
                <li><Link href="/apply" className="text-gray-600 hover:text-savians-navy">Become a Referral Partner</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
            <p>&copy; {new Date().getFullYear()} Savians. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
