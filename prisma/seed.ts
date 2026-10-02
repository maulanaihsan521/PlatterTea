// Seed data PlatterTea — sesuai Master Prompt (Bagian 100)
import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding PlatterTea data...')

  // ===== CATEGORIES =====
  const platterCat = await prisma.category.upsert({
    where: { slug: 'platter' },
    update: {},
    create: { name: 'Platter', slug: 'platter', sortOrder: 1, description: 'Mix Platter makanan ringan' },
  })
  const teaCat = await prisma.category.upsert({
    where: { slug: 'tea' },
    update: {},
    create: { name: 'Tea', slug: 'tea', sortOrder: 2, description: 'Pilihan teh segar' },
  })
  const comboCat = await prisma.category.upsert({
    where: { slug: 'combo' },
    update: {},
    create: { name: 'Combo', slug: 'combo', sortOrder: 3, description: 'Paket Platter + Tea' },
  })

  // ===== PRODUCTS =====
  const products = [
    {
      slug: 'platter-only',
      name: 'Platter Only',
      categoryId: platterCat.id,
      price: 15000,
      shortDesc: 'Mix Platter dengan kentang goreng, sosis, bola ayam, dan saus mayones.',
      fullDesc:
        'Platter Only adalah paket Mix Platter favorit yang berisi kentang goreng renyah, sosis, bola ayam, dan saus mayones. Cocok untuk camilan saat nongkrong, belajar, atau sekadar mengisi lapar di sela aktivitas.',
      composition: 'Kentang Goreng\nSosis\nBola Ayam\nSaus Mayones',
      mainImage: '/products/platter-only.png',
      featured: true,
      sortOrder: 1,
      portion: '1 orang',
    },
    {
      slug: 'tea-only',
      name: 'Tea Only',
      categoryId: teaCat.id,
      price: 8000,
      shortDesc: 'Pilihan teh segar untuk menemani harimu.',
      fullDesc:
        'Tea Only adalah pilihan minuman teh segar dengan harga bersahabat. Tersedia dalam beberapa varian: Original Tea, Yakult Tea, Teh Tarik, dan Teh Susu.',
      composition: 'Pilihan varian: Original Tea\nYakult Tea\nTeh Tarik\nTeh Susu',
      mainImage: '/products/tea-only.png',
      featured: false,
      sortOrder: 2,
      portion: '1 orang',
    },
    {
      slug: 'plattertea-combo',
      name: 'PlatterTea Combo',
      categoryId: comboCat.id,
      price: 21000,
      shortDesc: 'Mix Platter dan 1 pilihan Tea dalam satu paket.',
      fullDesc:
        'PlatterTea Combo adalah paket hemat berisi 1 Mix Platter dan 1 pilihan Tea favoritmu. Satu paket lengkap untuk menemani harimu.',
      composition: '1 Mix Platter\n1 Pilihan Tea\nBisa pilih varian tea sesuai selera',
      mainImage: '/products/plattertea-combo.png',
      featured: true,
      sortOrder: 3,
      portion: '1 orang',
    },
    {
      slug: 'bestie-combo',
      name: 'Bestie Combo',
      categoryId: comboCat.id,
      price: 35000,
      shortDesc: '2 Mix Platter dan 2 pilihan Tea untuk dinikmati bersama.',
      fullDesc:
        'Bestie Combo adalah paket berbagi berisi 2 Mix Platter dan 2 pilihan Tea. Paling pas untuk dinikmati bareng bestie, teman kampus, atau rekan kerja.',
      composition: '2 Mix Platter\n2 Pilihan Tea\nCocok untuk berbagi berdua',
      mainImage: '/products/bestie-combo.png',
      featured: false,
      sortOrder: 4,
      portion: '2 orang',
    },
    {
      slug: 'original-tea',
      name: 'Original Tea',
      categoryId: teaCat.id,
      price: 8000,
      shortDesc: 'Teh original klasik yang segar dan menyegarkan.',
      fullDesc: 'Original Tea adalah teh melati manis klasik dengan es batu. Rasa yang familiar dan selalu pas untuk cuaca panas maupun menemani makan.',
      composition: 'Teh Melati\nGula Cair\nEs Batu',
      mainImage: '/products/original-tea.png',
      featured: false,
      sortOrder: 5,
      portion: '1 orang',
    },
    {
      slug: 'yakult-tea',
      name: 'Yakult Tea',
      categoryId: teaCat.id,
      price: 8000,
      shortDesc: 'Perpaduan teh segar dengan yakult yang unik dan nikmat.',
      fullDesc: 'Yakult Tea adalah perpaduan teh segar dengan yakult yang memberikan rasa asam manis yang unik dan menyegarkan.',
      composition: 'Teh\nYakult\nGula Cair\nEs Batu',
      mainImage: '/products/yakult-tea.png',
      featured: false,
      sortOrder: 6,
      portion: '1 orang',
    },
    {
      slug: 'teh-tarik',
      name: 'Teh Tarik',
      categoryId: teaCat.id,
      price: 8000,
      shortDesc: 'Teh tarik creamy dengan foam lembut khasmamak.',
      fullDesc: 'Teh Tarik dengan tekstur creamy dan foam lembut khas tarik mamak, manisnya pas dan bikin nagih.',
      composition: 'Teh Susu\nSusu Kental Manis\nEs Batu',
      mainImage: '/products/teh-tarik.png',
      featured: false,
      sortOrder: 7,
      portion: '1 orang',
    },
    {
      slug: 'teh-susu',
      name: 'Teh Susu',
      categoryId: teaCat.id,
      price: 8000,
      shortDesc: 'Teh susu manis creamy favorit semua kalangan.',
      fullDesc: 'Teh Susu adalah kombinasi teh dan susu creamy yang manisnya pas, favorit semua kalangan.',
      composition: 'Teh\nSusu\nGula\nEs Batu',
      mainImage: '/products/teh-susu.png',
      featured: false,
      sortOrder: 8,
      portion: '1 orang',
    },
  ]

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    })
  }

  // ===== PROMOTIONS =====
  // Sesuai Business Plan Section 6 (funnel pemasaran & kalender promosi H-7 s.d. H+1):
  // promo terbaru "Spesial Market Days" + layanan Open PO via WhatsApp sejak H-7
  const promos = [
    {
      title: 'SPESIAL MARKET DAYS',
      subtitle: 'Promo Terbaru — Diskon Rp2.000 Semua Produk!',
      description:
        'Promo spesial saat event Market Days di kampus! Dapatkan diskon Rp2.000 untuk semua produk PlatterTea. Bisa pesan lebih awal lewat Open PO via WhatsApp mulai H-7, lalu ambil di booth tanpa antre.',
      image: '/products/plattertea-combo.png',
      featured: true,
      ctaLabel: 'Chat via WhatsApp',
      sortOrder: 1,
    },
    {
      title: 'BESTIE COMBO',
      subtitle: '2 Platter + 2 Tea',
      description:
        'Paket hemat untuk berbagi bareng bestie! Dapatkan 2 Mix Platter dan 2 pilihan Tea dengan harga spesial Rp35.000 saja.',
      image: '/products/bestie-combo.png',
      featured: false,
      ctaLabel: 'Lihat Informasi',
      sortOrder: 2,
    },
    {
      title: 'Open PO via WhatsApp Mulai H-7',
      subtitle: 'Pesan Lebih Awal, Ambil di Booth Tanpa Antre',
      description:
        'PlatterTea membuka Open PO via WhatsApp mulai H-7 sebelum acara (Market Days, seminar, dan kepanitiaan kampus) hingga ditutup H-1. Pesanan diambil di booth pada hari acara — praktis tanpa antre!',
      image: '/products/hero.png',
      featured: false,
      ctaLabel: 'Chat via WhatsApp',
      sortOrder: 3,
    },
  ]

  for (const promo of promos) {
    const existing = await prisma.promotion.findFirst({ where: { title: promo.title } })
    if (existing) {
      await prisma.promotion.update({ where: { id: existing.id }, data: promo })
    } else {
      await prisma.promotion.create({ data: promo })
    }
  }
  // Hapus promo lama yang sudah digantikan "SPESIAL MARKET DAYS"
  await prisma.promotion.deleteMany({ where: { title: 'Diskon Spesial Selama Market Days!' } })

  // ===== TESTIMONIALS =====
  const testimonials = [
    { name: 'Ayu Lestari', role: 'Mahasiswa', content: 'Rasanya enak, porsinya pas, dan teh nye juga segar. Jadi favorit di kampus!', rating: 5, sortOrder: 1 },
    { name: 'Rizky Pratama', role: 'Mahasiswa', content: 'PlatterTea jadi pilihan terbaik saat acara di kampus. Praktis banget, langsung jadi favorit!', rating: 5, sortOrder: 2 },
    { name: 'Sinta Dewi', role: 'Panitia Acara', content: 'Harganya pas, kualitasnya mantap. Cocok banget buat acara kampus seperti Market Days!', rating: 5, sortOrder: 3 },
  ]
  for (const t of testimonials) {
    const existing = await prisma.testimonial.findFirst({ where: { name: t.name } })
    if (!existing) await prisma.testimonial.create({ data: t })
  }

  // ===== FAQ =====
  const faqs = [
    { question: 'Apa itu PlatterTea?', answer: 'PlatterTea adalah brand Food & Tea yang menghadirkan kombinasi makanan ringan (Mix Platter) dan minuman teh dengan konsep yang praktis, fresh, dan menyenangkan.', sortOrder: 1 },
    { question: 'Apa saja produk PlatterTea?', answer: 'Produk kami terdiri dari Platter Only, Tea Only, PlatterTea Combo, Bestie Combo, dan varian tea seperti Original Tea, Yakult Tea, Teh Tarik, dan Teh Susu.', sortOrder: 2 },
    { question: 'Berapa harga produk PlatterTea?', answer: 'Platter Only Rp15.000, Tea Only Rp8.000, PlatterTea Combo Rp21.000, dan Bestie Combo Rp35.000. Semua varian tea seharga Rp8.000.', sortOrder: 3 },
    { question: 'Dimana lokasi PlatterTea?', answer: 'PlatterTea biasanya hadir di acara kampus dan bazar seperti Market Days. Untuk info lokasi terbaru, silakan hubungi kami via WhatsApp atau cek Instagram kami.', sortOrder: 4 },
    { question: 'Bagaimana cara mendapatkan informasi produk?', answer: 'Kamu bisa melihat menu dan detail produk di website ini, atau langsung tanya via WhatsApp untuk informasi lebih lanjut.', sortOrder: 5 },
    { question: 'Bagaimana cara menghubungi PlatterTea?', answer: 'Kamu bisa menghubungi kami melalui WhatsApp, Instagram, TikTok, atau email. Semua kontak tersedia di halaman Contact.', sortOrder: 6 },
    { question: 'Bagaimana cara Open PO untuk Market Days?', answer: 'Open PO dibuka via WhatsApp mulai H-7 sebelum acara dan ditutup H-1. Chat admin kami dengan format: nama, paket yang dipesan, varian tea, dan jumlah. Pesanan diambil di booth PlatterTea saat Market Days tanpa perlu antre!', sortOrder: 7 },
    { question: 'Apakah bisa pesan untuk acara selain Market Days?', answer: 'Bisa! PlatterTea menerima Open PO untuk seminar, kepanitiaan, dan acara kampus lainnya. Pesan minimal H-7 sebelum acara via WhatsApp agar produksi bisa disiapkan.', sortOrder: 8 },
  ]
  for (const f of faqs) {
    const existing = await prisma.faq.findFirst({ where: { question: f.question } })
    if (!existing) await prisma.faq.create({ data: f })
  }

  // ===== SITE SETTINGS =====
  const settings: Record<string, string> = {
    hero_title: 'Mix, Sip, Enjoy!',
    hero_subtitle: 'Perpaduan Mix Platter dan Tea untuk menemani setiap momenmu.',
    hero_badge: 'Segar, Lezat, Praktis!',
    about_story:
      'PlatterTea adalah brand Food & Tea yang menghadirkan kombinasi makanan ringan dan minuman teh dengan konsep yang praktis, fresh, dan menyenangkan.',
    about_vision: 'Menjadi brand Food & Tea yang dikenal mudah, segar, dan menyenangkan bagi anak muda Indonesia.',
    about_mission:
      'Menyajikan Mix Platter dan Tea berkualitas dengan harga bersahabat.\nMenghadirkan pengalaman kuliner yang praktis dan menyenangkan.\nSelalu menjaga kualitas dan higienitas di setiap produksi.',
    whatsapp: '6285175397747',
    whatsapp_display: '+62 851-7539-7747',
    email: 'plattertea@gmail.com',
    address: 'Telkom University Purwokerto, Jl. D.I. Panjaitan No. 128, Purwokerto, Kab. Banyumas, Jawa Tengah 53147',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Telkom+University+Purwokerto',
    maps_embed:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3956.270756540308!2d109.24651767500141!3d-7.435263092575548!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e655ea49d9f9885%3A0x62be0b6159700ec9!2sTelkom%20University%20Purwokerto!5e0!3m2!1sen!2sid!4v1790927483123!5m2!1sen!2sid',
    opening_hours: 'Senin - Minggu (07:00 - 20:00)',
    instagram_url: 'https://instagram.com/plattertea',
    instagram_display: '@plattertea',
    tiktok_url: 'https://tiktok.com/@plattertea',
    tiktok_display: '@plattertea',
    seo_title: 'PlatterTea — Food & Tea | Mix, Sip, Enjoy!',
    seo_description:
      'PlatterTea menghadirkan Mix Platter dan berbagai pilihan Tea dengan konsep yang fresh, praktis, dan menyenangkan.',
  }
  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } })
  }

  // ===== ADMIN USER =====
  // KEAMANAN (ISO/IEC 27001 A.9.4): kredensial admin WAJIB dari environment variable.
  // Tanpa ADMIN_EMAIL & ADMIN_PASSWORD, seed MELEWATI pembuatan admin (tanpa fallback hardcoded).
  const { scryptSync, randomBytes } = await import('crypto')
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD
  if (adminEmail && adminPassword && adminPassword.length >= 12) {
    const salt = randomBytes(16).toString('hex')
    const adminHash = `${salt}:${scryptSync(adminPassword, salt, 64).toString('hex')}`
    await prisma.adminUser.upsert({
      where: { email: adminEmail },
      update: { status: 'ACTIVE' },
      create: {
        email: adminEmail,
        name: 'Admin PlatterTea',
        passwordHash: adminHash,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
      },
    })
    console.log(`Admin user ready → ${adminEmail} (password dari env, tidak ditampilkan)`)
  } else {
    console.warn('Admin user DILEWATI — set ADMIN_EMAIL & ADMIN_PASSWORD (min 12 karakter) di .env untuk membuat admin.')
  }

  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
