"use client"

export function HomePage() {
  return (
    <div className="relative bg-background min-h-[200vh] lg:min-h-[200vh]">
      <div className="relative px-4 py-8 md:py-12 min-h-[200vh] lg:min-h-[135vh]">
        {/* Wavy Background - Only in this section */}
        <div className="absolute inset-0 z-0">
          {/* Top Wave */}
          <svg 
            className="absolute top-0 left-0 w-full h-[60vh]" 
            viewBox="0 0 1440 800" 
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FB923C" />
                <stop offset="50%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#EA580C" />
              </linearGradient>
            </defs>
            <path 
              d="M0,0 C240,150 480,200 720,180 C960,160 1200,100 1440,150 L1440,0 L0,0 Z" 
              fill="url(#waveGradient)"
            />
          </svg>
          
          {/* Bottom Wave */}
          <svg 
            className="absolute bottom-0 left-0 w-full h-[60vh]" 
            viewBox="0 0 1440 800" 
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="waveGradient2" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#EA580C" />
                <stop offset="50%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#FB923C" />
              </linearGradient>
            </defs>
            <path 
              d="M0,800 C240,650 480,600 720,620 C960,640 1200,700 1440,650 L1440,800 L0,800 Z" 
              fill="url(#waveGradient2)"
            />
          </svg>
        </div>

        {/* TRANSPARAN - Pojok Kanan Atas */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 lg:top-12 lg:right-16 lg:left-auto lg:translate-x-0 overflow-visible w-[85vw] sm:w-[70vw] md:w-[60vw] lg:w-[25vw] z-50">
          <div className="relative inline-block w-full">
            {/* Frame Border */}
            <div className="absolute inset-0 border-3 sm:border-4 border-gray-200 dark:border-gray-700 rounded-2xl sm:rounded-3xl pointer-events-none z-20 shadow-lg"></div>
            
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 rounded-2xl sm:rounded-3xl shadow-xl"></div>
            
            {/* Text */}
            <span className="relative z-10 font-bold text-center text-[8vw] sm:text-[7vw] md:text-[6vw] lg:text-[3.5vw] leading-none tracking-tighter text-white whitespace-nowrap px-3 py-2 sm:px-4 sm:py-3 md:px-5 md:py-4 block drop-shadow-lg">
              TRANSPARAN
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative w-full px-4 md:px-6 lg:px-8 z-20">
          <div className="max-w-[1400px] mx-auto scale-90 md:scale-95 lg:scale-100">
            
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-10 lg:gap-20 mb-8">
              {/* Left Content */}
              <div className="max-w-[536px] pt-0 md:pt-10 lg:pb-10">
              </div>
            </div>

            {/* Top 3 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-gray-200 dark:border-gray-700">
              {[
                {
                  gradient: "linear-gradient(177deg, rgb(9, 138, 95) 2.45%, rgb(5, 227, 156) 97.55%)",
                  icon: "/images/scroll/2.webp",
                  title: "Ruang Kerja Tim Bersama",
                  desc: "Kredit bersama dan perpustakaan aset yang terintegrasi menjaga tim Anda tetap sinkron dan memungkinkan kolaborasi yang lancar sepanjang alur kerja."
                },
                {
                  gradient: "linear-gradient(177deg, rgb(67, 49, 94) 2.45%, rgb(168, 119, 217) 97.55%)",
                  icon: "/images/scroll/3.webp",
                  title: "Sertifikasi ISO27001, SOC2 Tipe II, & GDPR",
                  desc: "Kami menyediakan keamanan tingkat perusahaan di setiap lapisan platform kami. Platform kami telah disertifikasi di bawah SOC2 Type II, ISO27001, dan GDPR."
                },
                {
                  gradient: "linear-gradient(177deg, rgb(251, 186, 111) 2.45%, rgb(255, 236, 225) 97.55%)",
                  icon: "/images/scroll/4.webp",
                  title: "Single Sign-On (SSO)",
                  desc: "DanaMasjid Enterprise mendukung SSO melalui SAML, memungkinkan login yang aman dan terpusat untuk tim besar menggunakan penyedia identitas seperti Okta, Google Workspace, atau Microsoft Entra."
                }
              ].map((card, index) => (
                <div
                  key={index}
                  className="flex flex-col p-4 md:p-8 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
                >
                  {/* Gradient Header with Icon */}
                  <div 
                    className="relative h-12 md:h-16 lg:h-20 w-full rounded-xl md:rounded-2xl rounded-tl-[32px] md:rounded-tl-[40px] lg:rounded-tl-[60px] shadow-lg mt-12 sm:mt-16 lg:mt-20 mb-4 md:mb-8"
                    style={{ background: card.gradient }}
                  >
                    <div className="absolute bottom-0 left-0 h-[200%] max-h-[160px] aspect-[340/160]">
                      <img
                        src={card.icon}
                        alt={card.title}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                  
                  {/* Text Content */}
                  <h4 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {card.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Bottom 4 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-900 rounded-[20px] border border-gray-200 dark:border-gray-700 p-4 md:p-0 md:bg-transparent md:border-0 mt-6">
              {[
                {
                  icon: "/images/scroll/5.webp",
                  title: "Privasi Data yang Ditingkatkan",
                  desc: "Data pelanggan perusahaan disimpan dalam database terpisah yang aman untuk memastikan privasi dan memenuhi kebutuhan kepatuhan organisasi."
                },
                {
                  icon: "/images/scroll/6.webp",
                  title: "Dukungan Akun Khusus",
                  desc: "Eksekutif akun dan insinyur solusi yang berdedikasi siap mendukung pengaturan perusahaan Anda dan membantu dengan pertanyaan umum apa pun dengan cepat."
                },
                {
                  icon: "/images/scroll/7.webp",
                  title: "Retensi Aset Selamanya",
                  desc: "Setelah dihasilkan, model Anda selalu tersedia untuk diunduh—kapan saja Anda membutuhkannya."
                },
                {
                  icon: "/images/scroll/8.webp",
                  title: "Penagihan Terpusat",
                  desc: "Semua anggota tim berbagi satu akun penagihan, sehingga memudahkan tim TI dan keuangan untuk mengelola pembayaran dan faktur."
                }
              ].map((card, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 md:gap-5 border-t border-gray-200 dark:border-gray-700 p-0 md:p-5 lg:px-8 lg:py-6"
                >
                  {/* Icon */}
                  <div className="relative size-16 sm:size-24 md:size-[120px] shrink-0">
                    <img
                      src={card.icon}
                      alt={card.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  {/* Text */}
                  <div>
                    <h4 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2 md:mb-3">
                      {card.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* JUJUR - Pojok Kiri Bawah */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 sm:bottom-12 lg:bottom-12 lg:left-16 lg:translate-x-0 overflow-visible w-[85vw] sm:w-[70vw] md:w-[60vw] lg:w-[25vw] z-50">
          <div className="relative inline-block w-full">
            {/* Frame Border */}
            <div className="absolute inset-0 border-3 sm:border-4 border-gray-200 dark:border-gray-700 rounded-2xl sm:rounded-3xl pointer-events-none z-20 shadow-lg"></div>
            
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 rounded-2xl sm:rounded-3xl shadow-xl"></div>
            
            {/* Text */}
            <span className="relative z-10 font-bold text-center text-[8vw] sm:text-[7vw] md:text-[6vw] lg:text-[3.5vw] leading-none tracking-tighter text-white whitespace-nowrap px-3 py-2 sm:px-4 sm:py-3 md:px-5 md:py-4 block drop-shadow-lg">
              JUJUR
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}