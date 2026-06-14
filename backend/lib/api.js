import { ApifyClient } from "apify-client";

const client = new ApifyClient({
  token: `${process.env.APIFY_TOKEN}`,
});

function parseFirstNumber(str) {
  if (!str) return null;

  const match = str.match(/\d+/);
  return match ? Number(match[0]) : null;
}

function parsePriceKm(str) {
  if (!str) return null;

  const digitsOnly = str.replace(/\D/g, "");
  return digitsOnly ? Number(digitsOnly) : null;
}

export async function fetchCarData(page) {
  const input = {
    urls: [
      `https://www.arabam.com/ikinci-el/otomobil/honda-civic?minYear=2021&maxYear=2025&page=${page}`,
    ],
    ignore_url_failures: true,
    max_items_per_url: 20,
    proxy: {
      useApifyProxy: true,
      apifyProxyGroups: ["RESIDENTIAL"],
      apifyProxyCountry: "US",
    },
  };

  const run = await client
    .actor("stealth_mode/arabam-cars-search-scraper")
    .call(input);

  console.log("Results from dataset");
  console.log(
    `💾 Check your data here: https://console.apify.com/storage/datasets/${run.defaultDatasetId}`,
  );
  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  console.log("HAM ITEM:");
  console.dir(items[0], { depth: null });
  const carDataArray = items.map((item) => {
    const engineCC = parseFirstNumber(
      item.detailed_properties?.find((p) => p.key === "Motor Hacmi")?.value,
    );

    const hp = parseFirstNumber(
      item.detailed_properties?.find((p) => p.key === "Motor Gücü")?.value,
    );

    const km = parsePriceKm(
      item.detailed_properties?.find((p) => p.key === "Kilometre")?.value,
    );

    const priceNumber = parsePriceKm(item.formatted_price);

    return {
      brand: item.categories?.find((c) => c.is_brand)?.name || null,
      model: item.model_name || null,
      year: item.year || null,
      bodyType:
        item.detailed_properties?.find((p) => p.key === "Kasa Tipi")?.value ||
        "sedan",
      fuelType:
        item.detailed_properties?.find((p) => p.key === "Yakıt Tipi")?.value ||
        null,
      engineCapacity: engineCC,
      horsepower: hp,
      transmission:
        item.detailed_properties?.find((p) => p.key === "Vites Tipi")?.value ||
        null,
      kilometer: km,
      price: priceNumber,
    };
  });
  return carDataArray;
}

// fetchCarData(3)
//   .then((data) => {
//     console.log("✅ fetchCarData çalıştı");
//     console.log(data);
//   })
//   .catch((err) => {
//     console.error("❌ Hata:", err);
//   });
