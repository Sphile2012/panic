import { Shield, ArrowLeft, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-16">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link to="/" className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center hover:bg-white/10 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg">Panic Ring</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-2">Terms & Conditions</h1>
        <p className="text-[#666] text-sm mb-2">Last updated: May 2026</p>
        <p className="text-[#666] text-sm mb-8">Effective date: May 1, 2026</p>

        {/* Important notice banner */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-8 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="text-amber-300 text-sm leading-relaxed">
            <strong>Important:</strong> Panic Ring is a supplementary personal safety tool. It is NOT a substitute for emergency services. Always call <strong>10111 (Police)</strong>, <strong>10177 (Ambulance)</strong>, or <strong>112 (Emergency)</strong> in a life-threatening situation.
          </p>
        </div>

        <div className="space-y-8 text-[#aaa] text-sm leading-relaxed">

          {/* 1 */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">1. Acceptance of Terms</h2>
            <p>By downloading, installing, registering for, or using the Panic Ring application and related services ("Service"), you ("User") agree to be legally bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms in their entirety, you must immediately cease using the Service.</p>
            <p className="mt-2">These Terms constitute a legally binding agreement between you and Panic Ring ("we", "us", "our", "the Company"), a personal safety technology service operating in South Africa.</p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">2. Description of Service</h2>
            <p>Panic Ring provides a personal safety platform that includes, but is not limited to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>SOS emergency alert notifications sent to user-designated contacts</li>
              <li>GPS location sharing during active emergency events</li>
              <li>Device tracking and "Find My Device" functionality</li>
              <li>Fall detection via device motion sensors</li>
              <li>Audio recording during emergency events</li>
              <li>Safe zone geofencing and exit alerts</li>
              <li>Smartwatch health monitoring integration</li>
            </ul>
            <p className="mt-2">The Service is designed as a <strong className="text-white">supplementary safety tool only</strong> and does not replace, and should never be used as a substitute for, official emergency services.</p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">3. GPS Location Accuracy — Important Disclosure</h2>
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 space-y-3">
              <p>Panic Ring uses your device's built-in GPS, Wi-Fi positioning, and cellular network data to determine your location. While we make every effort to provide accurate location data, you acknowledge and agree that:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-white">GPS accuracy varies</strong> between approximately 3 and 50 metres depending on your device hardware, satellite signal strength, and environmental conditions (buildings, tunnels, weather).</li>
                <li><strong className="text-white">Indoor accuracy is reduced.</strong> GPS signals are significantly weakened or unavailable inside buildings, underground, or in dense urban areas.</li>
                <li><strong className="text-white">We display accuracy estimates</strong> (e.g. "±15m") alongside all location data so recipients can assess reliability.</li>
                <li><strong className="text-white">Location updates require internet connectivity.</strong> If your device is offline, the last known location is used and clearly marked as such.</li>
                <li><strong className="text-white">You are responsible</strong> for ensuring location permissions are granted and that your device's location services are enabled for the Service to function correctly.</li>
                <li>Panic Ring shall not be held liable for any harm, loss, or failure to render assistance arising from inaccurate, delayed, or unavailable location data.</li>
              </ul>
            </div>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">4. Limitation of Liability</h2>
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 space-y-3">
              <p>To the fullest extent permitted by applicable South African law, including the Consumer Protection Act 68 of 2008 and the Electronic Communications and Transactions Act 25 of 2002:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Panic Ring, its directors, employees, agents, partners, and service providers shall <strong className="text-white">not be liable</strong> for any direct, indirect, incidental, special, consequential, or punitive damages arising from your use of, or inability to use, the Service.</li>
                <li>We are <strong className="text-white">not liable</strong> for any failure of emergency contacts to receive, read, or act upon alerts sent through the Service.</li>
                <li>We are <strong className="text-white">not liable</strong> for any delay, failure, or inaccuracy in GPS location data transmitted during an emergency.</li>
                <li>We are <strong className="text-white">not liable</strong> for any failure of the Service caused by network outages, device failure, loss of power, software bugs, or any other technical failure beyond our reasonable control.</li>
                <li>We are <strong className="text-white">not liable</strong> for any harm resulting from your reliance on the Service as your sole means of emergency communication.</li>
                <li>We are <strong className="text-white">not liable</strong> for false alarms, accidental activations, or any consequences thereof.</li>
                <li>We are <strong className="text-white">not liable</strong> for any third-party services (WhatsApp, Google Maps, SMS providers) that are used to deliver alerts.</li>
                <li>Our total aggregate liability to you for any claim shall not exceed the total subscription fees paid by you in the three (3) months preceding the event giving rise to the claim.</li>
              </ul>
            </div>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">5. No Guarantee of Emergency Response</h2>
            <p>Panic Ring does <strong className="text-white">not</strong> directly contact emergency services (police, ambulance, fire) on your behalf unless you have explicitly enabled the "Auto-call 911" feature and your device supports it. The Service notifies your personally designated emergency contacts only.</p>
            <p className="mt-2">You acknowledge that:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Your designated contacts may not be available, may not have their phone on, or may not respond in time.</li>
              <li>WhatsApp and email delivery is subject to third-party network availability.</li>
              <li>Panic Ring does not monitor alerts in real time and does not dispatch any response teams.</li>
              <li>In any emergency, you should always attempt to contact official emergency services directly.</li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">6. User Responsibilities</h2>
            <p>You agree to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Provide accurate personal information during registration.</li>
              <li>Keep your account credentials confidential and not share them with others.</li>
              <li>Ensure your emergency contacts have consented to receive emergency notifications from you.</li>
              <li>Maintain your device in working order with sufficient battery and data connectivity.</li>
              <li>Grant the necessary device permissions (location, microphone, camera) for the Service to function.</li>
              <li>Not use the Service for any unlawful purpose, including stalking, harassment, or surveillance of others without consent.</li>
              <li>Not trigger false SOS alerts intentionally.</li>
              <li>Notify us immediately if you become aware of any unauthorised use of your account.</li>
            </ul>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">7. Disclaimer of Warranties</h2>
            <p>The Service is provided on an <strong className="text-white">"as is" and "as available"</strong> basis without warranties of any kind, either express or implied, including but not limited to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Warranties of merchantability or fitness for a particular purpose.</li>
              <li>Warranties that the Service will be uninterrupted, error-free, or completely secure.</li>
              <li>Warranties regarding the accuracy, reliability, or completeness of any location data.</li>
              <li>Warranties that alerts will be delivered within any specific timeframe.</li>
            </ul>
            <p className="mt-2">We do not warrant that the Service will prevent harm, injury, or death.</p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">8. Indemnification</h2>
            <p>You agree to indemnify, defend, and hold harmless Panic Ring and its directors, employees, agents, and service providers from and against any claims, liabilities, damages, losses, costs, and expenses (including reasonable legal fees) arising out of or in connection with:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Your use or misuse of the Service.</li>
              <li>Your violation of these Terms.</li>
              <li>Your violation of any applicable law or regulation.</li>
              <li>Any false or misleading information you provide.</li>
              <li>Any claim by a third party arising from your use of the Service.</li>
            </ul>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">9. Subscription, Billing & Cancellation</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Subscription fees are billed monthly or annually as selected at sign-up.</li>
              <li>All fees are in South African Rand (ZAR) and are inclusive of applicable VAT.</li>
              <li>You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. No refunds are issued for partial periods.</li>
              <li>We reserve the right to change pricing with 30 days' written notice.</li>
              <li>Failure to pay may result in suspension or termination of your account.</li>
            </ul>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">10. Intellectual Property</h2>
            <p>All content, software, trademarks, logos, and intellectual property within the Service are owned by or licensed to Panic Ring. You are granted a limited, non-exclusive, non-transferable licence to use the Service for personal, non-commercial purposes only. You may not copy, modify, distribute, sell, or reverse-engineer any part of the Service.</p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">11. Privacy</h2>
            <p>Your use of the Service is also governed by our <Link to="/privacy" className="text-red-400 underline hover:text-red-300">Privacy Policy</Link>, which is incorporated into these Terms by reference. By using the Service, you consent to the collection and use of your data as described in the Privacy Policy.</p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">12. Termination</h2>
            <p>We reserve the right to suspend or terminate your account at any time, with or without notice, if we reasonably believe you have violated these Terms, engaged in fraudulent activity, or if required by law. Upon termination, your right to use the Service ceases immediately.</p>
          </section>

          {/* 13 */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">13. Governing Law & Dispute Resolution</h2>
            <p>These Terms are governed by and construed in accordance with the laws of the Republic of South Africa. Any dispute arising from these Terms or your use of the Service shall first be attempted to be resolved through good-faith negotiation. If unresolved within 30 days, disputes shall be submitted to the jurisdiction of the South African courts.</p>
          </section>

          {/* 14 */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">14. Changes to These Terms</h2>
            <p>We may update these Terms at any time. We will notify you of material changes via email or an in-app notification at least 14 days before the changes take effect. Your continued use of the Service after the effective date constitutes acceptance of the updated Terms. If you do not agree to the updated Terms, you must stop using the Service.</p>
          </section>

          {/* 15 */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">15. Severability</h2>
            <p>If any provision of these Terms is found to be unenforceable or invalid under applicable law, that provision shall be modified to the minimum extent necessary to make it enforceable, and the remaining provisions shall continue in full force and effect.</p>
          </section>

          {/* 16 */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">16. Entire Agreement</h2>
            <p>These Terms, together with the Privacy Policy, constitute the entire agreement between you and Panic Ring regarding your use of the Service and supersede all prior agreements, representations, and understandings.</p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">17. Contact</h2>
            <p>For questions about these Terms, please contact us:</p>
            <div className="mt-3 bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 space-y-1">
              <p><strong className="text-white">Email:</strong> poomeigh503@gmail.com</p>
              <p><strong className="text-white">App:</strong> Panic Ring</p>
              <p><strong className="text-white">Location:</strong> South Africa</p>
            </div>
          </section>

        </div>

        {/* Bottom acknowledgement */}
        <div className="mt-10 bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 text-center">
          <p className="text-[#666] text-xs leading-relaxed">
            By using Panic Ring, you confirm that you have read, understood, and agreed to these Terms and Conditions in full.
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <Link to="/privacy" className="text-red-400 text-xs underline hover:text-red-300">Privacy Policy</Link>
            <Link to="/" className="text-red-400 text-xs underline hover:text-red-300">Back to App</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
