/**
 * Update konten website sesuai dokumen resmi (BMC_PlatterTea.pdf & Business_Plan_PlatterTea (3).pdf):
 * 1. Produk — komposisi, deskripsi, porsi (Business Plan Section 1.3, Tabel 2 & 3)
 * 2. FAQ — Open PO H-7 → H-4 (BMC: open PO H-4 s.d. H-1, tutup H-1)
 * 3. Promo — judul/deskripsi Open PO H-4
 * Idempotent: aman dijalankan berulang.
 */
import './db-env'
import { PrismaClient } from '../src/generated/prisma'
const db = new PrismaClient()

// ===== 1. PRODUK (Business Plan 1.3 Product + Tabel 2 & 3) =====
const PRODUCT_UPDATES: Array<{
  slug: string
  data: { shortDesc?: string; fullDesc?: string; composition?: string; portion?: string }
}> = [
  {
    slug: 'platter-only',
    data: {
      portion: '250–300 gram',
      composition: 'Kentang Goreng\nPotongan Sosis\nBola-Bola Ayam\nSaus Mayones',
      shortDesc:
        'Mix Platter porsi standar 250–300 gram: kentang goreng, potongan sosis, bola-bola ayam, dan saus mayones.',
      fullDesc:
        'Platter Only adalah satu porsi Mix Platter — camilan gurih berisi kentang goreng, potongan sosis, bola-bola ayam kecil, dan saus mayones. Porsi standar 250–300 gram sesuai resep standar, disajikan hangat pada tray tertutup agar mudah dibawa: kematangan merata, kentang tetap renyah, dan porsi yang sama untuk setiap pembelian. Cocok untuk camilan saat nongkrong, belajar, atau mengisi lapar di sela aktivitas.',
    },
  },
  {
    slug: 'tea-only',
    data: {
      portion: '1 gelas (semua varian)',
      fullDesc:
        'Tea Only adalah 1 gelas teh pilihan — semua varian tersedia: Original Tea, Yakult Tea, Teh Tarik, dan Teh Susu. Disajikan segar dengan harga bersahabat untuk menemani harimu.',
    },
  },
  {
    slug: 'plattertea-combo',
    data: {
      composition: '1 Mix Platter\n1 Teh Pilihan (semua varian)\nHemat dibanding beli terpisah',
      fullDesc:
        'PlatterTea Combo adalah paket 1 Mix Platter + 1 teh pilihan dalam satu transaksi — makanan dan minuman beres sekaligus, tanpa antre di dua tempat. Pilih varian tea favoritmu saat pemesanan.',
    },
  },
  {
    slug: 'bestie-combo',
    data: {
      composition: '2 Mix Platter\n2 Teh Pilihan (semua varian)\nPaling pas untuk berbagi berdua',
      fullDesc:
        'Bestie Combo adalah paket 2 Mix Platter + 2 teh pilihan untuk dibarengi bestie, teman kampus, atau rekan kerja. Nilai lebih untuk yang berbagi — harga spesial dibanding beli terpisah.',
    },
  },
  {
    slug: 'original-tea',
    data: {
      composition: 'Seduhan Teh\nGula sesuai pilihan\nEs Batu',
      shortDesc: 'Rasa teh murni, ringan, dan segar — diseduh per pesanan.',
      fullDesc:
        'Original Tea adalah seduhan teh dengan gula sesuai pilihan. Diseduh per pesanan dan disajikan dingin — rasa teh murni, ringan, dan segar untuk menemani aktivitasmu.',
    },
  },
  {
    slug: 'yakult-tea',
    data: {
      composition: 'Seduhan Teh\nYakult\nEs Batu',
      shortDesc: 'Manis-asam, segar — diracik per pesanan lalu dikocok.',
      fullDesc:
        'Yakult Tea adalah perpaduan seduhan teh dan Yakult yang diracik per pesanan lalu dikocok. Rasa manis-asam yang segar dan unik — pilihan tepat untuk teh yang berbeda.',
    },
  },
  {
    slug: 'teh-tarik',
    data: {
      composition: 'Teh\nSusu\nGula\nDitarik hingga berbusa',
      shortDesc: 'Rasa teh kuat, gurih, dan berbusa — ditarik saat disajikan.',
      fullDesc:
        'Teh Tarik diseduh dengan rasa teh yang lebih kuat, lalu ditarik hingga berbusa saat disajikan. Gurih dan creamy dengan resep yang ditegaskan berbeda dari Teh Susu.',
    },
  },
  {
    slug: 'teh-susu',
    data: {
      composition: 'Teh\nSusu\nKrimer resep tetap\nDikocok dalam batch kecil',
      shortDesc: 'Manis, lembut, creamy — racikan susu dan krimer resep tetap.',
      fullDesc:
        'Teh Susu diracik dengan campuran susu dan krimer resep tetap sehingga lebih manis dan lembut, dikocok dalam batch kecil agar rasa konsisten. Manisnya pas, favorit semua kalangan.',
    },
  },
]

// ===== 2. FAQ (BMC: open PO H-4 s.d. H-1) =====
const FAQ_UPDATES = [
  {
    question: 'Bagaimana cara Open PO untuk Market Days?',
    answer:
      'Open PO dibuka via WhatsApp mulai H-4 sebelum acara dan ditutup H-1. Chat admin kami dengan format: nama, paket yang dipesan, varian tea, dan jumlah. Pesanan diambil di booth PlatterTea saat Market Days tanpa perlu antre.',
  },
  {
    question: 'Apakah bisa pesan untuk acara selain Market Days?',
    answer:
      'Bisa! PlatterTea menerima Open PO untuk seminar, kepanitiaan, dan acara kampus lainnya. Pesan mulai H-4 (ditutup H-1) sebelum acara via WhatsApp agar produksi bisa disiapkan.',
  },
]

async function main() {
  // Produk
  for (const { slug, data } of PRODUCT_UPDATES) {
    const r = await db.product.updateMany({ where: { slug }, data })
    console.log(`product[${slug}] → updated=${r.count}`)
  }
  // FAQ (by question, idempotent)
  for (const { question, answer } of FAQ_UPDATES) {
    const r = await db.faq.updateMany({ where: { question }, data: { answer } })
    console.log(`faq[${question.slice(0, 30)}…] → updated=${r.count}`)
  }
  // Promo: H-7 → H-4 pada judul & deskripsi Open PO
  const promo = await db.promotion.findFirst({ where: { title: { contains: 'Open PO' } } })
  if (promo) {
    const title = promo.title.replace(/H-7/g, 'H-4')
    const description = (promo.description || '').replace(/mulai H-7/g, 'mulai H-4')
    const r = await db.promotion.update({
      where: { id: promo.id },
      data: { title, description },
    })
    console.log(`promotion[${r.title}] → updated`)
  } else {
    console.log('promotion Open PO: tidak ditemukan (skip)')
  }
  console.log('DONE')
}

main().finally(() => db.$disconnect())
