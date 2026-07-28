"use client";

import { motion } from "framer-motion";
import { Rocket, BookOpen, Cpu, Target, Telescope } from "lucide-react";
import classes from "./Hakkimizda.module.css";
import {
  hakkimizdaItemVariants,
  hakkimizdaSectionVariants,
} from "../utils/animations";

export default function Hakkimizda() {
  return (
    <div className={classes.aboutContainer}>
      <motion.div
        className={classes.section}
        variants={hakkimizdaSectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.h1
          className={classes.mainTitle}
          variants={hakkimizdaItemVariants}
        >
          <Rocket className={classes.titleIcon} size={40} />
          <span>
            <span className={classes.brandHighlight}>YapayOto:</span> İkinci El
            Araç Piyasasında Veri, Yapay Zeka ve Güvenin Yeni Adresi
          </span>
        </motion.h1>
        <motion.p
          className={classes.paragraph}
          variants={hakkimizdaItemVariants}
        >
          İkinci el araç alım-satım süreçlerindeki en büyük zorluk nedir? "Acaba
          doğru fiyata mı alıyorum/satıyorum?" endişesi. YapayOto olarak biz, bu
          endişeyi tamamen ortadan kaldırmak ve otomotiv piyasasına şeffaflık
          getirmek amacıyla yola çıktık. İnsan hatasını, piyasa
          manipülasyonlarını ve bilgi kirliliğini aradan çıkararak; kararları
          verilere ve ileri teknoloji algoritmalarına bırakan yenilikçi bir
          dijital platformuz.
        </motion.p>
      </motion.div>

      <motion.div
        className={classes.section}
        variants={hakkimizdaSectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.h2
          className={classes.subTitle}
          variants={hakkimizdaItemVariants}
        >
          <BookOpen className={classes.subTitleIcon} size={28} />
          <span>Hikayemiz</span>
        </motion.h2>
        <motion.p
          className={classes.paragraph}
          variants={hakkimizdaItemVariants}
        >
          Her şey, otomotiv pazarındaki değerleme tutarsızlıklarını çözmek
          amacıyla atılan güçlü bir akademik mühendislik adımıyla başladı.
          Kurucumuz Selim Polat tarafından geliştirilen ve gücünü derin öğrenme
          algoritmalarından alan sistemimiz, kısa sürede bireysel kullanıcıların
          ve profesyonellerin güvenle kullanabileceği tam donanımlı bir
          teknoloji platformuna dönüştü. Bugün YapayOto, sadece bir ilan sitesi
          değil; alıcı ve satıcı arasındaki güven köprüsünü matematik, veri
          bilimi ve kodlarla inşa eden bir mühendislik ürünüdür.
        </motion.p>
      </motion.div>

      <motion.div
        className={classes.section}
        variants={hakkimizdaSectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.h2
          className={classes.subTitle}
          variants={hakkimizdaItemVariants}
        >
          <Cpu className={classes.subTitleIcon} size={28} />
          <span>Teknolojimiz ve Farkımız</span>
        </motion.h2>
        <motion.p
          className={classes.paragraph}
          variants={hakkimizdaItemVariants}
        >
          Bizleri standart ilan platformlarından ayıran en büyük özellik,
          sistemimizin kalbinde yatan Makine Öğrenmesi (Machine Learning)
          teknolojileridir:
        </motion.p>
        <motion.ul className={classes.list} variants={hakkimizdaItemVariants}>
          <li>
            <strong>Akıllı Araç Değerleme Modeli: </strong>
            <span>
              Aracın marka, model, kilometre, hasar ve donanım verilerini analiz
              eden sistemimiz, piyasa gerçekliklerine uygun en optimum fiyatı
              saniyeler içinde hesaplar.
            </span>
          </li>
          <li>
            <strong>Görüntü İşleme ve Sınıflandırma: </strong>
            <span>
              Araç fotoğraflarını analiz edebilen yapay zeka algoritmalarımız
              sayesinde görsel verileri anlamlandırır ve süreçleri
              hızlandırırız.
            </span>
          </li>
          <li>
            <strong>Yapay Zeka ile İlan Özetleme: </strong>
            <span>
              Uzun, okuması yorucu ve karmaşık ilan açıklamalarını Doğal Dil
              İşleme (NLP) teknolojisiyle anında analiz ediyor,
              kullanıcılarımıza en kritik bilgileri net bir özet halinde
              sunuyoruz.
            </span>
          </li>
          <li>
            <strong>Bağımsız ve Güvenli Mimari: </strong>
            <span>
              Sistemimiz dışarıdan veya üçüncü parti bulut bilişim (cloud
              computing) sistemlerine bağımlı çalışmaz. Veri gizliliği ve yüksek
              hız odaklı, tamamen optimize edilmiş özel bir altyapı üzerinde,
              kendi mimarimizle kesintisiz hizmet veriyoruz.
            </span>
          </li>
        </motion.ul>
      </motion.div>

      <motion.div
        className={classes.section}
        variants={hakkimizdaSectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.h2
          className={classes.subTitle}
          variants={hakkimizdaItemVariants}
        >
          <Target className={classes.subTitleIcon} size={28} />
          <span>Misyonumuz</span>
        </motion.h2>
        <motion.p
          className={classes.paragraph}
          variants={hakkimizdaItemVariants}
        >
          Geleneksel, yavaş ve güvensiz araç ticaretini; veri odaklı, saniyeler
          içinde sonuç veren ve her iki tarafı da koruyan adil bir ekosisteme
          dönüştürmek.
        </motion.p>
      </motion.div>

      <motion.div
        className={classes.section}
        variants={hakkimizdaSectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.h2
          className={classes.subTitle}
          variants={hakkimizdaItemVariants}
        >
          <Telescope className={classes.subTitleIcon} size={28} />
          <span>Vizyonumuz</span>
        </motion.h2>
        <motion.p
          className={classes.paragraph}
          variants={hakkimizdaItemVariants}
        >
          Türkiye'de ikinci el araç denildiğinde akla gelen ilk "Yapay Zeka
          Onaylı" referans noktası olmak ve teknolojinin gücüyle otomotiv
          sektörünün dijital dönüşümüne liderlik etmek.
        </motion.p>
        <motion.div
          className={classes.highlight}
          variants={hakkimizdaItemVariants}
        >
          <strong>
            YapayOto ile aracınızın gerçek değerini keşfedin, geleceğin
            ticaretine bugünden katılın.
          </strong>
        </motion.div>
      </motion.div>
    </div>
  );
}
