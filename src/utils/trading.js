export const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export const weekdayShort = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const defaultPairs = [
  "EURUSD",
  "GBPUSD",
  "USDJPY",
  "USDCHF",
  "AUDUSD",
  "USDCAD",
  "NZDUSD",
  "EURGBP",
  "EURJPY",
  "EURAUD",
  "EURCAD",
  "EURCHF",
  "EURNZD",
  "GBPAUD",
  "GBPJPY",
  "GBPCAD",
  "GBPCHF",
  "GBPNZD",
  "AUDJPY",
  "AUDCAD",
  "AUDCHF",
  "AUDNZD",
  "NZDJPY",
  "USDMXN",
  "USDPLN",
  "XAUUSD",
  "XAGUSD",
  "XPTUSD",
  "XPDUSD",
  "BRENT",
  "BTCUSD",
  "ETHUSD",
  "US500",
  "USTEC",
  "WS30",
  "AUS200",
  "HK50",
  "JPN225",
  "EURO50",
  "FRA40",
  "GER40",
  "NED25",
  "SWI20",
  "UK100",
  "AAPL",
  "MSFT",
  "GOOG",
  "NVDA",
  "META",
  "TSLA",
  "AMZN",
  "AMD",
  "NFLX",
  "Volatility 10 Index",
  "Volatility 5 Index",
  "Volatility 5 (1s) Index",
  "Volatility 25 Index",
  "Volatility 50 Index",
  "Volatility 75 Index",
  "Volatility 100 Index",
  "Volatility 10 (1s) Index",
  "Volatility 25 (1s) Index",
  "Volatility 50 (1s) Index",
  "Volatility 75 (1s) Index",
  "Volatility 100 (1s) Index",
  "Boom 300 Index",
  "Boom 500 Index",
  "Boom 600 Index",
  "Boom 900 Index",
  "Boom 1000 Index",
  "Crash 300 Index",
  "Crash 500 Index",
  "Crash 600 Index",
  "Crash 900 Index",
  "Crash 1000 Index",
  "Jump 10 Index",
  "Jump 25 Index",
  "Jump 50 Index",
  "Jump 75 Index",
  "Jump 100 Index",
  "Step Index",
  "Multi Step Index",
  "Range Break 100 Index",
  "Range Break 200 Index",
];

export const moodValues = [
  "FOCUSED",
  "CONFIDENT",
  "CALM",
  "UNCERTAIN",
  "FEARFUL",
  "GREEDY",
];

export const formatDateKey = (value) => {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const currency = (value) => {
  const number = Number(value || 0);
  return `${number >= 0 ? "+" : "-"}$${Math.abs(number).toFixed(2)}`;
};

export const getResultBadge = (result) => {
  const normalized = String(result || "").toLowerCase();
  if (normalized.includes("win"))
    return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30";
  if (normalized.includes("loss"))
    return "bg-red-500/15 text-red-300 border border-red-500/30";
  return "bg-amber-500/15 text-amber-300 border border-amber-500/30";
};

export const resolveImageUrl = (value) => {
  if (!value) return null;

  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized) return null;

  if (/^(data:|https?:\/\/|blob:)/i.test(normalized)) return normalized;
  if (normalized.startsWith("//")) return `https:${normalized}`;

  const apiBase = (
    import.meta.env.VITE_API_URL || "https://jornal.rgmrabagardama.com.ng/api"
  ).replace(/\/api\/?$/, "");
  const root = apiBase.replace(/\/$/, "");

  if (normalized.startsWith("/")) {
    return `${root}${normalized}`;
  }

  return `${root}/${normalized}`;
};

export const getChartImageValue = (journal, key) => {
  const lookupTable = {
    "4H": ["highTimeFrameImage", "highTimeFramelmage", "highTimeFrame"],
    "15M": ["mediumTimeFrameImage", "mediumTimeFramelmage", "mediumTimeFrame"],
    "5M": ["lowTimeFrameImage", "lowTimeFramelmage", "lowTimeFrame"],
  };

  const candidates = lookupTable[key] || [];
  for (const field of candidates) {
    const value = journal?.[field];
    if (value !== null && value !== undefined && value !== "") return value;
  }

  return null;
};

export const formatTradeDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
