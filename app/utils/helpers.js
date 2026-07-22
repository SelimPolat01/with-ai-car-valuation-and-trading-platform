import { LogIn, UserPlus, Home } from "lucide-react";
import classes from "@/app/components/Header.module.css";

export function formatBrandModel(text) {
  if (!text) return "";
  if (text === "bmw") return "BMW";
  if (text == "mercedes-benz") return "Mercedes-Benz";
  if (text === "i20") return "i20";
  if (text == "a series") return "A Serisi";
  if (text == "e series") return "E Serisi";
  if (text == "1 series") return "1 Serisi";
  if (text == "3 series") return "3 Serisi";
  if (text == "5 series") return "5 Serisi";
  if (text == "c-elysee") return "C-Elysee";
  if (text == "t-roc") return "T-Roc";

  return text
    .split(" ")
    .map((word) =>
      word
        .split("-")
        .map(
          (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase(),
        )
        .join("-"),
    )
    .join(" ");
}

export function engineCapacityFormat(engineCapacity) {
  if (!engineCapacity) return "";
  return (+engineCapacity / 1000).toFixed(1);
}

export const carTypeMap = {
  bodyTypeMap: {
    sedan: "Sedan",
    suv: "SUV",
    hatchback: "Hatchback",
  },
  fuelTypeMap: {
    gasoline: "Benzin",
    diesel: "Dizel",
    electric: "Elektrik",
    hybrid: "Hibrit",
  },
  transmissionTypeMap: {
    automatic: "Otomatik",
    "semi automatic": "Yarı Otomatik",
    manual: "Manuel",
  },
  trimLevelMap: { ambition: "Ambition" },
};

export function modelParser(model, choice) {
  if (!model) return "";
  const normalizedModel = model.toLowerCase();

  const parsedModel = {
    celysee: choice === "url" ? "c-elysee" : "C-Elysee",
    cseries: choice === "url" ? "c series" : "C Serisi",
    eseries: choice === "url" ? "e series" : "E Serisi",
    "1series": choice === "url" ? "1 series" : "1 Serisi",
    "3series": choice === "url" ? "3 series" : "3 Serisi",
    "5series": choice === "url" ? "5 series" : "5 Serisi",
    troc: choice === "url" ? "t-roc" : "T-Roc",
    megane: choice === "url" ? "megane" : "Megane",
    civic: choice === "url" ? "civic" : "Civic",
    egea: choice === "url" ? "egea" : "Egea",
    clio: choice === "url" ? "clio" : "Clio",
    corolla: choice === "url" ? "corolla" : "Corolla",
    passat: choice === "url" ? "passat" : "Passat",
    polo: choice === "url" ? "polo" : "Polo",
    i20: "i20",
    duster: choice === "url" ? "duster" : "Duster",
    tiguan: choice === "url" ? "tiguan" : "Tiguan",
    focus: choice === "url" ? "focus" : "Focus",
    fiesta: choice === "url" ? "fiesta" : "Fiesta",
    golf: choice === "url" ? "golf" : "Golf",
    a3: choice === "url" ? "a3" : "A3",
    jetta: choice === "url" ? "jetta" : "Jetta",
    c3: choice === "url" ? "c3" : "C3",
    a4: choice === "url" ? "a4" : "A4",
    cruze: choice === "url" ? "cruze" : "Cruze",
    c4: choice === "url" ? "c4" : "C4",
    "1 series": "1 Series",
    "3 series": "3 Series",
    "5 series": "5 Series",
    "c series": "C Series",
    "e series": "E Series",
  };

  if (parsedModel[normalizedModel]) {
    return parsedModel[normalizedModel];
  }

  return model.charAt(0).toUpperCase() + model.slice(1).toLowerCase();
}

export function brandParser(brand) {
  if (!brand) return "";
  const normalizedBrand = brand.toLowerCase();
  if (normalizedBrand === "bmw") return "BMW";
  return brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase();
}

export function bodyTypeParser(bodyType) {
  if (!bodyType) return "";
  const normalizedBodyType = bodyType.toLowerCase();
  if (normalizedBodyType === "suv") return "SUV";
  return bodyType.charAt(0).toUpperCase() + bodyType.slice(1).toLowerCase();
}

export function formatPrice(price) {
  if (!price) return "";
  return Number(price).toLocaleString("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function generateYearList(yearInterval) {
  if (!yearInterval) return [];
  const [startYear, endYear] = yearInterval.split("-").map(Number);
  const years = [];
  for (let i = startYear; i <= endYear; i++) {
    years.push(i);
  }
  return years;
}

export function generateChartData(data) {
  if (!data || data.length === 0) {
    const months = [
      "Oca",
      "Şub",
      "Mar",
      "Nis",
      "May",
      "Haz",
      "Tem",
      "Ağu",
      "Eyl",
      "Eki",
      "Kas",
      "Ara",
    ];
    return months.map((m) => ({ month: m, count: 0 }));
  }
  return data.map((item) => ({
    month: item.name ? item.name.substring(0, 3) : item.month,
    count: item.ilanSayisi !== undefined ? item.ilanSayisi : item.count || 0,
  }));
}

export function formatAndCleanBrand(brand) {
  if (!brand) return;
  if (brand == "mercedes-benz") return "mercedes";
  return brand;
}

export const headerLinks = {
  notLoginlinks: [
    {
      href: "/register",
      label: (
        <UserPlus
          className={classes.icon}
          size={30}
          stroke="url(#header-icon-gold)"
        />
      ),
      hideOn: "/register",
      className: "registerLink",
      title: "Kayıt Ol",
    },
    {
      href: "/login",
      label: (
        <LogIn
          className={classes.icon}
          size={30}
          stroke="url(#header-icon-gold)"
        />
      ),
      hideOn: "/login",
      className: "loginLink",
      title: "Giriş Yap",
    },
  ],
  loginLinks: [
    {
      href: "/",
      label: (
        <Home
          className={classes.icon}
          size={30}
          stroke="url(#header-icon-gold)"
        />
      ),
      hideOn: "/",
      className: "homeLink",
      title: "Anasayfa",
    },
  ],
};

export const blobUrlToFile = async (blobUrl, filename) => {
  try {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return new File([blob], filename, {
      type: blob.type || "application/pdf",
    });
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const generateSlug = (text) => {
  if (!text) return "";
  return text.toString().toLowerCase().trim().replace(/\s+/g, "-");
};

export const getStepFromStatus = (status) => {
  if (!status) return 1;
  const s = String(status).toLowerCase();

  if (s === "1" || s === "pending") return 1;
  if (s === "2" || s === "appointment") return 2;
  if (s === "3" || s === "expertise" || s === "control") return 3;
  if (s === "4" || s === "escrow" || s === "payment") return 4;
  if (s === "5" || s === "notary") return 5;
  if (s === "success" || s === "completed") return 6;

  return 1;
};

export const getStatusBadgeText = (status) => {
  if (!status) return "Satın Alma Sürecinde";
  const s = String(status).toLowerCase();

  if (s === "success") return "İlan Alım Satım Tamamlandı";
  if (s === "5") return "Noter Sürecinde";
  if (s === "4") return "Ödeme Sürecinde";
  if (s === "3") return "Ekspertiz Kontrolünde";
  if (s === "2") return "Yetkili Randevu Sürecinde";
  if (s === "1") return "Satın Alma Sürecinde";

  return "Satın Alma Sürecinde";
};

export const getExpertiseStatusText = (step) => {
  if (step === 2) return "Randevu Alındı";
  if (step >= 3) return "Tamamlandı";
  return "Bekleniyor";
};

export const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export const capitalizeWords = (text) => {
  if (typeof text !== "string" || !text) return "";

  return text
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const formatLpgStatus = (status) => {
  if (!status) return "Yok / Takılmadı";
  const map = {
    none: "Yok (Benzin/Dizel/Elektrik)",
    "registered license": "Var - Ruhsata İşli",
    "not registered license": "Var - Ruhsata İşli Değil",
  };
  return map[status.toLowerCase()] || status;
};

export const formatTireType = (type) => {
  if (!type) return "Belirtilmedi";
  const map = {
    summery: "Yazlık",
    winter: "Kışlık",
    "four seasons": "Dört Mevsim",
  };
  return map[type.toLowerCase()] || type;
};

export const formatTireCondition = (condition) => {
  if (!condition) return "";
  const map = {
    "like new": "Sıfır Ayarında",
    good: "İyi",
    "change has come": "Değişim Vakti Gelmiş",
  };
  return map[condition.toLowerCase()] || condition;
};

export const formatAppointmentDateTime = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return "";

  let cleanDateStr = dateStr;
  if (typeof dateStr === "string" && dateStr.includes("T")) {
    cleanDateStr = dateStr.split("T")[0];
  }

  let day, month, year;
  if (cleanDateStr.includes("-")) {
    const parts = cleanDateStr.split("-");
    if (parts[0].length === 4) {
      year = parts[0];
      month = parts[1];
      day = parts[2];
    } else {
      day = parts[0];
      month = parts[1];
      year = parts[2];
    }
  } else if (cleanDateStr.includes(".")) {
    const parts = cleanDateStr.split(".");
    day = parts[0];
    month = parts[1];
    year = parts[2];
  } else if (cleanDateStr.includes("/")) {
    const parts = cleanDateStr.split("/");
    if (parts[0].length === 4) {
      year = parts[0];
      month = parts[1];
      day = parts[2];
    } else {
      day = parts[0];
      month = parts[1];
      year = parts[2];
    }
  } else {
    return `${cleanDateStr} ${timeStr}`;
  }

  const formattedDate = `${day}-${month}-${year}`;

  const timeParts = timeStr.split(":");
  const formattedTime =
    timeParts.length >= 2 ? `${timeParts[0]}:${timeParts[1]}` : timeStr;

  return `${formattedDate} ${formattedTime}`;
};

export function getAylikIlanVerileri(kisiselIlanlar = []) {
  const aylarDizisi = [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık",
  ];

  return aylarDizisi.map((ay, indeks) => {
    const ilanSayisi = kisiselIlanlar.filter((ilan) => {
      if (!ilan.created_at) return false;
      const ilanTarihi = new Date(ilan.created_at);
      if (isNaN(ilanTarihi.getTime())) return false;
      return ilanTarihi.getMonth() === indeks;
    }).length;

    return {
      name: ay,
      ilanSayisi: ilanSayisi,
    };
  });
}

export const formatMaliDeger = (deger) => {
  const mutlakDeger = Math.abs(deger);
  let metin = "";

  if (mutlakDeger >= 1000000) {
    const milyon = mutlakDeger / 1000000;
    metin =
      milyon % 1 === 0 ? `${milyon} Milyon ₺` : `${milyon.toFixed(1)} Milyon ₺`;
  } else if (mutlakDeger >= 1000) {
    const bin = mutlakDeger / 1000;
    metin = bin % 1 === 0 ? `${bin} Bin ₺` : `${bin.toFixed(1)} Bin ₺`;
  } else {
    metin = `${mutlakDeger} ₺`;
  }

  return deger < 0 ? `-${metin}` : metin;
};

export const getStatusData = (status) => {
  switch (status) {
    case "completed":
    case "success":
      return { text: "Tamamlandı", className: classes.badgeCompleted };
    case "canceled":
      return { text: "İptal Edildi", className: classes.badgeCanceled };
    case "pending":
    default:
      return { text: "Bekliyor", className: classes.badgePending };
  }
};

export const formatDayName = (date) => {
  return date.toLocaleDateString("tr-TR", { weekday: "short" }).toUpperCase();
};

export const formatDayNumber = (date) => {
  return date.getDate();
};

export const formatMonthName = (date) => {
  return date.toLocaleDateString("tr-TR", { month: "short" }).toUpperCase();
};

export const formatForDB = (dateObj) => {
  const d = new Date(dateObj);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function fuelTypeFormat(fuelType) {
  if (!fuelType) return "";
  const parsedFuelType = {
    gasoline: "Benzin",
    diesel: "Dizel",
    hybrid: "Hibrit",
    lpg: "LPG",
  };
  return parsedFuelType[fuelType];
}

export const generateErrorMessage = (errors) => {
  if (!errors) return null;
  let messages = [];
  if (errors.phones && errors.phones.length > 0)
    messages.push(`Telefon (${errors.phones.join(", ")})`);
  if (errors.persons && errors.persons.length > 0)
    messages.push(`İsim (${errors.persons.join(", ")})`);
  if (errors.locations && errors.locations.length > 0)
    messages.push(`Adres/Konum (${errors.locations.join(", ")})`);

  return messages.length > 0
    ? `Yasaklı içerik tespit edildi:\n${messages.join(" | ")}`
    : null;
};

export const viewsList = [
  {
    id: "front",
    label: "Ön",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a0aec0'%3E%3Cpath d='M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z'/%3E%3C/svg%3E",
  },
  {
    id: "back",
    label: "Arka",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a0aec0'%3E%3Cpath d='M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM5 11l1.5-4.5h11L19 11H5zm0 2.5h3v2H5v-2zm11 0h3v2h-3v-2zm-6.5 1h5v1.5h-5v-1.5z'/%3E%3C/svg%3E",
  },
  {
    id: "right",
    label: "Sağ Yan",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256' fill='%23a0aec0'%3E%3Cg transform='translate(256, 0) scale(-1, 1)'%3E%3Cpath d='M240,112H227.2l-13.43-40.29A24,24,0,0,0,191,56H88a24,24,0,0,0-21.78,14.07L46.88,112H16a8,8,0,0,0-8,8v48a8,8,0,0,0,8,8H30.86a32,32,0,0,0,62.28,0H162.86a32,32,0,0,0,62.28,0H240a8,8,0,0,0,8-8V120A8,8,0,0,0,240,112ZM88,72h103l13.33,40H49.11ZM62,184a16,16,0,1,1,16-16A16,16,0,0,1,62,184Zm132,0a16,16,0,1,1,16-16A16,16,0,0,1,194,184Zm38-24H217.14a32,32,0,0,0-46.28,0H85.14a32,32,0,0,0-46.28,0H24V128H232Z'/%3E%3C/g%3E%3C/svg%3E",
  },
  {
    id: "left",
    label: "Sol Yan",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256' fill='%23a0aec0'%3E%3Cpath d='M240,112H227.2l-13.43-40.29A24,24,0,0,0,191,56H88a24,24,0,0,0-21.78,14.07L46.88,112H16a8,8,0,0,0-8,8v48a8,8,0,0,0,8,8H30.86a32,32,0,0,0,62.28,0H162.86a32,32,0,0,0,62.28,0H240a8,8,0,0,0,8-8V120A8,8,0,0,0,240,112ZM88,72h103l13.33,40H49.11ZM62,184a16,16,0,1,1,16-16A16,16,0,0,1,62,184Zm132,0a16,16,0,1,1,16-16A16,16,0,0,1,194,184Zm38-24H217.14a32,32,0,0,0-46.28,0H85.14a32,32,0,0,0-46.28,0H24V128H232Z'/%3E%3C/svg%3E",
  },
];

export const generateDamageText = (predictions) => {
  const sidesTr = {
    front: "ön",
    back: "arka",
    right: "sağ yan",
    left: "sol yan",
  };
  let damageElements = [];
  for (const [side, damage] of Object.entries(predictions)) {
    if (damage && damage.toLowerCase() !== "clean") {
      let hasarElement = damage.toLowerCase().includes("scratch") ? (
        <span style={{ color: "#d97706", fontWeight: "600" }}>çizik</span>
      ) : damage.toLowerCase().includes("dent") ? (
        <span style={{ color: "#ea580c", fontWeight: "600" }}>göçük</span>
      ) : (
        <span>hasar</span>
      );

      damageElements.push(
        <span key={side}>
          {sidesTr[side]} kısmında {hasarElement}
        </span>,
      );
    }
  }
  if (damageElements.length === 0)
    return "Aracınızda herhangi bir hasar tespit edilmemiştir.";

  return (
    <span>
      Yapay zekâ modelimiz aracınızın{" "}
      {damageElements.map((el, i) => (
        <span key={i}>
          {el}
          {i < damageElements.length - 1 ? ", " : " "}
        </span>
      ))}{" "}
      tespit etmiştir. Bu durum fiyat teklifine yansıtılacaktır.
    </span>
  );
};

export const carGenerationsObject = {
  audi: {
    a3: {
      hatchback: [
        { start: 2004, end: 2012, interval: "2004-2012" },
        { start: 2012, end: 2016, interval: "2012-2016" },
        { start: 2016, end: 2020, interval: "2016-2020" },
        { start: 2020, end: 2024, interval: "2020-2024" },
        { start: 2024, end: 2025, interval: "2024-2025" },
      ],
      sedan: [
        { start: 2013, end: 2016, interval: "2013-2016" },
        { start: 2016, end: 2020, interval: "2016-2020" },
        { start: 2020, end: 2025, interval: "2020-2025" },
      ],
    },
    a4: {
      sedan: [
        { start: 2012, end: 2015, interval: "2012-2015" },
        { start: 2015, end: 2019, interval: "2015-2019" },
        { start: 2019, end: 2024, interval: "2019-2024" },
      ],
    },
  },
  bmw: {
    "1series": {
      hatchback: [
        { start: 2004, end: 2011, interval: "2004-2011" },
        { start: 2011, end: 2014, interval: "2011-2014" },
        { start: 2015, end: 2019, interval: "2015-2019" },
        { start: 2019, end: 2025, interval: "2019-2025" },
      ],
    },
    "3series": {
      sedan: [
        { start: 2012, end: 2015, interval: "2012-2015" },
        { start: 2015, end: 2019, interval: "2015-2019" },
        { start: 2019, end: 2023, interval: "2019-2023" },
        { start: 2023, end: 2025, interval: "2023-2025" },
      ],
    },
    "5series": {
      sedan: [
        { start: 2007, end: 2010, interval: "2007-2010" },
        { start: 2011, end: 2016, interval: "2011-2016" },
        { start: 2017, end: 2023, interval: "2017-2023" },
        { start: 2024, end: 2025, interval: "2024-2025" },
      ],
    },
  },
  chevrolet: {
    cruze: {
      sedan: [
        { start: 2009, end: 2012, interval: "2009-2012" },
        { start: 2012, end: 2013, interval: "2012-2013" },
      ],
      hatchback: [{ start: 2011, end: 2013, interval: "2011-2013" }],
    },
  },
  citroen: {
    c3: {
      hatchback: [
        { start: 2002, end: 2009, interval: "2002-2009" },
        { start: 2010, end: 2016, interval: "2010-2016" },
        { start: 2016, end: 2020, interval: "2016-2020" },
        { start: 2020, end: 2024, interval: "2020-2024" },
      ],
    },
    c4: {
      hatchback: [
        { start: 2014, end: 2020, interval: "2014-2020" },
        { start: 2020, end: 2024, interval: "2020-2024" },
        { start: 2024, end: 2025, interval: "2024-2025" },
      ],
    },
    celysee: {
      sedan: [
        { start: 2012, end: 2017, interval: "2012-2017" },
        { start: 2017, end: 2023, interval: "2017-2023" },
      ],
    },
  },
  dacia: {
    duster: {
      suv: [
        { start: 2010, end: 2017, interval: "2010-2017" },
        { start: 2018, end: 2023, interval: "2018-2023" },
        { start: 2024, end: 2024, interval: "2024-2024" },
      ],
    },
  },
  fiat: {
    egea: {
      sedan: [
        { start: 2015, end: 2021, interval: "2015-2021" },
        { start: 2021, end: 2026, interval: "2021-2026" },
      ],
      hatchback: [
        { start: 2016, end: 2021, interval: "2016-2021" },
        { start: 2021, end: 2024, interval: "2021-2024" },
      ],
    },
  },
  ford: {
    fiesta: {
      hatchback: [
        { start: 2008, end: 2013, interval: "2008-2013" },
        { start: 2013, end: 2017, interval: "2013-2017" },
        { start: 2017, end: 2020, interval: "2017-2020" },
      ],
    },
    focus: {
      sedan: [
        { start: 2011, end: 2014, interval: "2011-2014" },
        { start: 2014, end: 2018, interval: "2014-2018" },
        { start: 2018, end: 2022, interval: "2018-2022" },
        { start: 2022, end: 2025, interval: "2022-2025" },
      ],
      hatchback: [
        { start: 2011, end: 2014, interval: "2011-2014" },
        { start: 2014, end: 2018, interval: "2014-2018" },
        { start: 2018, end: 2022, interval: "2018-2022" },
        { start: 2022, end: 2025, interval: "2022-2025" },
      ],
    },
  },
  honda: {
    civ: {
      sedan: [
        { start: 2006, end: 2011, interval: "2006-2011" },
        { start: 2011, end: 2016, interval: "2011-2016" },
        { start: 2016, end: 2021, interval: "2016-2021" },
        { start: 2021, end: 2025, interval: "2021-2025" },
      ],
    },
  },
  hyundai: {
    i20: {
      hatchback: [
        { start: 2014, end: 2020, interval: "2014-2020" },
        { start: 2020, end: 2025, interval: "2020-2025" },
      ],
    },
  },
  mercedes: {
    cseries: {
      sedan: [
        { start: 2007, end: 2011, interval: "2007-2011" },
        { start: 2011, end: 2014, interval: "2011-2014" },
        { start: 2014, end: 2021, interval: "2014-2021" },
        { start: 2021, end: 2025, interval: "2021-2025" },
      ],
    },
    eseries: {
      sedan: [
        { start: 2009, end: 2013, interval: "2009-2013" },
        { start: 2014, end: 2016, interval: "2014-2016" },
        { start: 2016, end: 2020, interval: "2016-2020" },
        { start: 2020, end: 2023, interval: "2020-2023" },
        { start: 2023, end: 2025, interval: "2023-2025" },
      ],
    },
  },
  renault: {
    clio: {
      hatchback: [
        { start: 2012, end: 2019, interval: "2012-2019" },
        { start: 2019, end: 2023, interval: "2019-2023" },
        { start: 2023, end: 2025, interval: "2019-2025" },
      ],
    },
    megane: {
      sedan: [
        { start: 2016, end: 2020, interval: "2016-2020" },
        { start: 2020, end: 2025, interval: "2020-2025" },
      ],
      hatchback: [
        { start: 2011, end: 2014, interval: "2011-2014" },
        { start: 2014, end: 2016, interval: "2014-2016" },
        { start: 2016, end: 2020, interval: "2016-2020" },
      ],
    },
  },
  toyota: {
    corolla: {
      sedan: [
        { start: 2013, end: 2018, interval: "2013-2018" },
        { start: 2019, end: 2026, interval: "2019-2026" },
      ],
    },
  },
  volkswagen: {
    golf: {
      hatchback: [
        { start: 2012, end: 2017, interval: "2012-2017" },
        { start: 2017, end: 2020, interval: "2017-2020" },
        { start: 2020, end: 2024, interval: "2020-2024" },
        { start: 2024, end: 2025, interval: "2024-2025" },
      ],
    },
    jetta: {
      sedan: [
        { start: 2012, end: 2017, interval: "2012-2017" },
        { start: 2014, end: 2017, interval: "2014-2017" },
      ],
    },
    passat: {
      sedan: [
        { start: 2011, end: 2014, interval: "2011-2014" },
        { start: 2014, end: 2019, interval: "2014-2019" },
        { start: 2019, end: 2022, interval: "2019-2022" },
      ],
    },
    polo: {
      hatchback: [
        { start: 2010, end: 2017, interval: "2010-2017" },
        { start: 2018, end: 2021, interval: "2018-2021" },
        { start: 2021, end: 2025, interval: "2021-2025" },
      ],
    },
    tiguan: {
      suv: [
        { start: 2011, end: 2016, interval: "2011-2016" },
        { start: 2016, end: 2020, interval: "2016-2020" },
        { start: 2020, end: 2024, interval: "2020-2024" },
        { start: 2024, end: 2025, interval: "2024-2025" },
      ],
    },
    troc: {
      suv: [
        { start: 2019, end: 2021, interval: "2019-2021" },
        { start: 2022, end: 2025, interval: "2022-2025" },
      ],
    },
  },
};

export function findIntervalFromYear(
  brandParam,
  modelParam,
  bodyType,
  modelYear,
) {
  if (!brandParam || !modelParam || !bodyType || !modelYear) return null;
  const brandKey = brandParam.toLowerCase().trim();
  let decodedModel = decodeURIComponent(modelParam);
  let modelKey = decodedModel
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "")
    .replace(/-/g, "");
  if (modelKey.includes("serisi")) {
    modelKey = modelKey.replace("serisi", "series");
  }
  const body = bodyType.toLowerCase().trim();
  const year = Number(modelYear);
  const generations = carGenerationsObject[brandKey]?.[modelKey]?.[body];
  if (!generations) {
    return null;
  }
  const foundGen = generations.find(
    (gen) => year >= gen.start && year <= gen.end,
  );
  return foundGen ? foundGen.interval : null;
}

export const getDbModelName = (modelParam) => {
  if (!modelParam) return "";
  let name = decodeURIComponent(modelParam).toLowerCase().trim();
  name = name.replace("serisi", "series");
  return name.replace(/[\s-]/g, "");
};

export const getCarStockImageSrcFunc = (brand, model, modelYear, bodyType) => {
  if (!brand || !model || !bodyType || !modelYear) return null;
  const modelStr = getDbModelName(model);
  const brandStr = brand.toLowerCase().trim();
  const bodyStr = bodyType.toLowerCase().trim();
  const finalYearInterval = findIntervalFromYear(
    brand,
    model,
    bodyType,
    modelYear,
  );
  if (!finalYearInterval) return null;
  const [startYear, endYear] = finalYearInterval.split("-");
  const shortYearInterval = `${startYear.slice(-2)}-${endYear.slice(-2)}`;
  return `/images/cars/${brand}/${brandStr}-${modelStr}-${bodyStr}-${shortYearInterval}.png`;
};

export function formatModelForApi(modelParam) {
  if (!modelParam) return "";
  let model = decodeURIComponent(modelParam).toLowerCase().trim();
  model = model.replace(/\s+/g, " ");
  return model;
}

export function formatBrandLowerParser(brand) {
  if (!brand) return;
  if (brand == "mercedes") return "mercedes-benz";
  return brand.toLowerCase();
}
