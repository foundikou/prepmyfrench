"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  Award,
  Video,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Mail,
  MessageCircle,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  Globe,
  UserCheck,
} from "lucide-react";

export default function LandingPage() {
  const [cookieConsent, setCookieConsent] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans selection:bg-blue-600 selection:text-white">
      {/* 🟢 TOP BAR ANNOUNCEMENT */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 text-white text-xs sm:text-sm py-2 px-4 text-center font-medium shadow-inner flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
        <span>Bienvenue sur <strong>PrepMyFrench</strong> — Votre réussite au TCF Canada commence ici.</span>
      </div>

      {/* 🔷 HEADER & NAVIGATION */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              PF
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">
              Prep<span className="text-blue-600">My</span>French
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <Link href="#accueil" className="text-blue-600 font-bold hover:text-blue-700 transition">Accueil</Link>
            <Link href="#epreuves" className="hover:text-blue-600 transition">Épreuves</Link>
            <Link href="#nouveautes" className="hover:text-blue-600 transition">Nouveautés</Link>
            <Link href="#tarifs" className="hover:text-blue-600 transition">Tarifs</Link>
            <Link href="#contact" className="hover:text-blue-600 transition">Contact</Link>
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-blue-600 transition"
            >
              Se connecter
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 hover:shadow-lg transition-all active:scale-95"
            >
              S'inscrire
            </Link>
          </div>
        </div>
      </header>

      {/* 🚀 HERO SECTION */}
      <section id="accueil" className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50 pt-16 pb-24 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
            <Award className="w-4 h-4" /> Plateforme Spécialisée TCF Canada & Québec
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Préparez et réussissez votre <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 bg-clip-text text-transparent">
              TCF Canada avec confiance
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Examens blancs chronométrés, retours détaillés en expression écrite et orale, et simulateur d'entraînement interactif en temps réel.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2"
            >
              Créer mon compte gratuit <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#epreuves"
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-all text-center"
            >
              Découvrir les épreuves
            </Link>
          </div>

          {/* QUICK MODULE ICON NAVIGATION GRID */}
          <div className="mt-16 pt-10 border-t border-slate-200/60 max-w-5xl mx-auto">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
              Accès rapide aux modules d'entraînement
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { name: "Résultat", icon: Award, color: "from-amber-400 to-orange-500" },
                { name: "E. Écrite", icon: PenTool, color: "from-blue-500 to-indigo-600" },
                { name: "E. Orale", icon: Mic, color: "from-purple-500 to-pink-600" },
                { name: "C. Écrite", icon: BookOpen, color: "from-emerald-500 to-teal-600" },
                { name: "C. Orale", icon: Headphones, color: "from-cyan-500 to-blue-600" },
                { name: "Examen Blanc", icon: Sparkles, color: "from-rose-500 to-red-600" },
              ].map((item, idx) => (
                <button
                  key={idx}
                  className="p-4 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-all group flex flex-col items-center text-center"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${item.color} text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-md`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition">
                    {item.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 🌟 FEATURED HIGHLIGHTS / NOUVEAUTÉS */}
      <section id="nouveautes" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block px-3 py-1 rounded-md bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
              Fonctionnalités Exclusives
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Nos Dernières Nouveautés
            </h2>
            <p className="mt-3 text-slate-600">
              Travaillez l'expression orale à l'unité et progressez avec des correcteurs certifiés.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* CARD 1: ZOOM EXAMINERS */}
            <div className="p-8 bg-slate-50 border border-slate-200/80 rounded-3xl hover:border-blue-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-md">
                    <Video className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">En visio sur Zoom</span>
                    <h3 className="text-xl font-bold text-slate-900">Examen blanc oral avec un examinateur</h3>
                  </div>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Simulations en conditions réelles, évaluées en direct par un examinateur officiel TCF. 40 minutes de session avec un compte-rendu pédagogique détaillé.
                </p>

                {/* Examiners profiles */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 mb-6 space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nos Examinateurs Qualifiés</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm border">EM</div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">EMMANUEL</p>
                        <p className="text-xs text-slate-500">Examinateur habilité TCF</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">Disponible</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm border">AH</div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">AHLEM</p>
                        <p className="text-xs text-slate-500">Examinatrice habilitée TCF</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">Disponible</span>
                  </div>
                </div>
              </div>

              <button className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition">
                Réserver une session
              </button>
            </div>

            {/* CARD 2: AI ORAL SIMULATOR */}
            <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Mic className="w-48 h-48" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-amber-400 text-slate-900 text-xs font-black uppercase px-3 py-1 rounded-full shadow-sm">
                    Premier au Monde
                  </span>
                  <span className="bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Interactif 100%
                  </span>
                </div>

                <h3 className="text-2xl font-black mb-3">
                  Recharge du simulateur oral — 15 essais
                </h3>
                <p className="text-blue-100 text-sm leading-relaxed mb-6">
                  Parlez, répondez, interagissez. Le premier simulateur intelligent d'expression orale pour perfectionner votre fluidité et prononciation.
                </p>

                <ul className="space-y-2.5 mb-8 text-sm">
                  {[
                    "15 essais d'expression orale supplémentaires",
                    "Évaluation instantanée après chaque simulation",
                    "Accessible 24h/24 sans date d'expiration",
                    "Adapté aux normes de cotation TCF Canada",
                  ].map((feat, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-blue-50">
                      <CheckCircle2 className="w-4 h-4 text-amber-300 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button className="relative z-10 w-full py-3.5 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-sm shadow-lg transition">
                Activer le simulateur
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 📞 SUPPORT & HELP BANNER */}
      <section id="contact" className="py-16 bg-blue-600 text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            
            <div className="lg:col-span-1">
              <h2 className="text-3xl font-black mb-3">Besoin d'aide ?</h2>
              <p className="text-blue-100 text-sm leading-relaxed mb-6">
                Notre équipe pédagogique est à votre disposition pour vous guider dans votre préparation.
              </p>

              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/10">
                  <Mail className="w-5 h-5 text-amber-300" />
                  <div>
                    <p className="text-xs text-blue-200">Email support</p>
                    <p className="font-semibold">support@prepmyfrench.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/10">
                  <MessageCircle className="w-5 h-5 text-emerald-300" />
                  <div>
                    <p className="text-xs text-blue-200">WhatsApp direct</p>
                    <p className="font-semibold">+1 506 253 6067</p>
                  </div>
                </div>
              </div>
            </div>

            {/* INTERACTIVE INQUIRY FORM BOX */}
            <div className="lg:col-span-2 bg-white text-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Une question spécifique ?</h3>
              <p className="text-slate-500 text-sm mb-6">
                Laissez-nous un message et nous vous répondrons sous 24 heures.
              </p>

              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Votre nom complet"
                    className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <input
                    type="email"
                    placeholder="Adresse e-mail"
                    className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <textarea
                  rows={3}
                  placeholder="Comment pouvons-nous vous aider ?"
                  className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                ></textarea>
                <button
                  type="submit"
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition shadow-md shadow-blue-600/20"
                >
                  Envoyer mon message
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* 🦶 FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-sm border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            
            <div className="md:col-span-2">
              <span className="text-xl font-black text-white">
                Prep<span className="text-blue-500">My</span>French
              </span>
              <p className="mt-3 text-slate-400 text-xs max-w-sm leading-relaxed">
                Maîtrisez les techniques essentielles et réussissez l'examen du TCF Canada avec une préparation guidée par des experts.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Liens Rapides</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="#accueil" className="hover:text-white transition">À propos</Link></li>
                <li><Link href="#tarifs" className="hover:text-white transition">Tarification</Link></li>
                <li><Link href="#faq" className="hover:text-white transition">Foire aux questions</Link></li>
                <li><Link href="#contact" className="hover:text-white transition">Nous contacter</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Légal</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#" className="hover:text-white transition">Confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition">Conditions Générales</a></li>
                <li><a href="#" className="hover:text-white transition">Politique des Cookies</a></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} PrepMyFrench. Tous droits réservés.
          </div>
        </div>
      </footer>

      {/* 🍪 COOKIE BANNER (Floating Modern Overlay) */}
      {cookieConsent && (
        <div className="fixed bottom-6 left-6 z-50 max-w-md bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-slate-200 animate-fade-in text-slate-800">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🍪</span>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Gestion des cookies</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Nous utilisons des cookies pour améliorer votre expérience sur PrepMyFrench.
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              onClick={() => setCookieConsent(false)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              Refuser
            </button>
            <button
              onClick={() => setCookieConsent(false)}
              className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow transition"
            >
              Tout accepter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}