import React from 'react';
import { BranchLogo } from './BranchLogo';
import { Phone, Mail, MapPin, ExternalLink, ShieldCheck, Heart } from 'lucide-react';

import type { BranchSettings } from '../types/appeal';

interface FooterProps {
  settings?: BranchSettings | null;
  onNav: (tab: 'home' | 'submit' | 'check' | 'stats' | 'contact' | 'admin') => void;
  onOpenAdminLogin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNav, onOpenAdminLogin }) => {
  return (
    <footer className="bg-[#0b264d] text-slate-300 border-t border-slate-800">
      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Column 1: Institution Info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <BranchLogo className="w-12 h-12" />
              <div>
                <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  Toshkent kimyo-texnologiya instituti
                </div>
                <h3 className="text-base font-extrabold text-white">
                  Yangiyer filiali
                </h3>
                <span className="text-xs text-slate-400">Murojaatlar portali</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Ushbu platforma Toshkent kimyo-texnologiya instituti Yangiyer filialiga fuqarolar, professor-o‘qituvchilar, talabalar va ota-onalarning murojaat, taklif va shikoyatlarini qonuniy tartibda qabul qilish hamda ijrosini ta’minlash maqsadida yaratilgan.
            </p>

            <div className="text-xs text-slate-400 flex items-center gap-2 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>O‘zbekiston Respublikasi Qonunchiligi asosida himoyalangan.</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-slate-700 pb-2">
              Tezkor havolalar
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => onNav('home')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Bosh sahifa
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNav('submit')}
                  className="hover:text-emerald-400 transition-colors text-emerald-300 font-semibold"
                >
                  Murojaat yuborish
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNav('check')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Murojaat holatini tekshirish
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNav('stats')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Statistika va ko‘rsatkichlar
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNav('contact')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Filial rahbariyati va aloqa
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAdminLogin}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Administrator paneli
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Governmental / Official Portals */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-slate-700 pb-2">
              Rasmiy davlat portallari
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <a
                  href="https://edu.uz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between hover:text-emerald-300 transition-colors p-1.5 rounded-lg hover:bg-slate-800/40"
                >
                  <span>Oliy ta’lim, fan va innovatsiyalar vazirligi</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://pm.gov.uz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between hover:text-emerald-300 transition-colors p-1.5 rounded-lg hover:bg-slate-800/40"
                >
                  <span>Prezident virtual qabulxonasi (pm.gov.uz)</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://my.gov.uz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between hover:text-emerald-300 transition-colors p-1.5 rounded-lg hover:bg-slate-800/40"
                >
                  <span>Yagona interaktiv davlat xizmatlari portali</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://tkti.uz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between hover:text-emerald-300 transition-colors p-1.5 rounded-lg hover:bg-slate-800/40"
                >
                  <span>TKTI rasmiy bosh veb-sayti (tkti.uz)</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </a>
              </li>
            </ul>

            <div className="pt-2 text-xs text-slate-300 space-y-1">
              <div>📍 {settings?.address || 'Sirdaryo viloyati, Yangiyer shahri, Tinchlik ko‘chasi, 1-uy'}</div>
              {settings?.hotline && (
                <div className="text-emerald-400 font-semibold">📞 Ishonch telefoni: {settings.hotline}</div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 mt-8 border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            © {new Date().getFullYear()} Toshkent kimyo-texnologiya instituti Yangiyer filiali. Barcha huquqlar himoyalangan.
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <span>Murojaatlar portali v2.0 • Ishonchli, ochiq va xolis tizim</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
