import type { AgentResult } from "../types";
import priceData from "../../data/pricing/kentank-zonal-2026-04-15.json";
import { zonalPrice } from "../knowledge/pricing";

type Zone = { name: string; areas: string[] };

const zones: Zone[] = [
 {name:"Zone 1 (0-50 km)",areas:["Nairobi","Karen","Ngong","Ongata Rongai","Rongai","Kitengela","Athi River","Ruai","Juja","Ruiru","Kikuyu"]},
 {name:"Zone 2 (51-100 km)",areas:["Muranga","Murang'a","Kajiado","Machakos","Naivasha"]},
 {name:"Zone 3 (101-150 km)",areas:["Magadi","Gilgil","Narok","Nyeri","Embu","Sultan Hamud"]},
 {name:"Zone 4 (151-250 km)",areas:["Nakuru","Namanga","Kitui","Mwingi","Molo","Nyahururu","Solai","Londiani","Kisima","Lorule","Nguni","Kibwezi","Mtito Andei"]},
 {name:"Zone 5 (251-350 km)",areas:["Kericho","Kisii","Archers Post","Isiolo","Meru","Marigat","Kisumu","Eldoret","Hola","Voi","Taveta","Maralal"]},
 {name:"Zone 6 (351-450 km)",areas:["Migori","Homa Bay","Homabay","Butere","Kitale","Tot","Kakamega","Tsavo","Bura","Garissa","Laisamis","Webuye"]},
 {name:"Zone 7 (451-550 km)",areas:["Busia","Modogashi","Baragoi","Lokichar","Lokori","Marsabit","Habaswein","Hagadera","Liboi"]},
 {name:"Zone 8 (551-650 km)",areas:["Loyangalani","N. Horr","Buna","Girito","Tarbaj","Wajir","Dif","Kolboi","Lamu","Kakuma","Lokichogio","Todenyang","Banya","Sabarei","Moyale","Elwak","Tabaka","Banassa","Ramu","Mandera"]}
];

const ccv: Record<string, number[]> = {
 "CCV 500 Short": [50830,51428,52624,53820,55016,57408,58604,59800],
 "CCV 500": [50830,51428,52624,53820,55016,57408,58604,59800],
 "CCV 600": [65166,65932,67466,68999,70532,73599,75132,76665]
};

function zoneFor(message:string): number | null {
 const lower=message.toLowerCase();
 for(let i=0;i<zones.length;i++) if(zones[i].areas.some(a=>lower.includes(a.toLowerCase()))) return i;
 return null;
}

function structuredOfficialAnswer(message: string): AgentResult | null {\n const lower = message.toLowerCase();\n const asksPrice = /(price|cost|how much|quotation|quote|pricelist|price list)/.test(lower);\n if (!asksPrice) return null;\n const zone = zoneFor(message);\n const matched = priceData.rows.find((row) => lower.includes(row.productCode.toLowerCase()));\n const capacityMatch = lower.match(/(\\d[\\d,]*)\\s*(?:l|litre|litres|liter|liters)\\b/);\n const capacity = capacityMatch ? Number(capacityMatch[1].replace(/,/g, "")) : undefined;\n const row = matched || (capacity == null ? undefined : priceData.rows.find((r) => r.capacityLitres === capacity));\n if (!row) return null;\n const result = zonalPrice(priceData.rows, { productCode: row.productCode, zone: zone == null ? undefined : zone + 1 }, priceData.source.url, priceData.source.effectiveDate);\n if (!result.priceKsh || result.zone == null) {\n   return { answer: "I found an official Kentainers price-list entry for " + row.productCode + " (" + row.capacityLitres.toLocaleString("en-KE") + " L), effective 15 April 2026, but I need the delivery town/location before I can return the applicable zonal price. The listed prices include VAT and Kentainers notes that prices may change without notice.", sources: [{ document: priceData.source.title }], action: "clarify" };\n }\n return { answer: "The official Kentainers price list effective 15 April 2026 lists " + row.productCode + " (" + row.capacityLitres.toLocaleString("en-KE") + " L) at KSh " + result.priceKsh.toLocaleString("en-KE") + " in " + zones[result.zone - 1].name + ", inclusive of VAT. Kentainers notes that prices may change without notice, so confirm the current quotation before ordering.", sources: [{ document: priceData.source.title }], action: "details" };\n}\nexport function answerPricing(message:string): AgentResult|null {
 const lower=message.toLowerCase();
 const asksPrice=/(price|cost|how much|quotation|quote|pricelist|price list)/.test(lower);
 if(!asksPrice) return null;
 const zone=zoneFor(message);
 const is5000=/5\s*,?\s*000\s*(l|litre|litres|liter|liters)?/.test(lower);
 const is6000=/6\s*,?\s*000\s*(l|litre|litres|liter|liters)?/.test(lower);
 const isGrain=/grain\s*silo/.test(lower);

 if(is5000){
   if(zone===null) return {answer:"For the official Kentainers zonal price list effective 15 April 2026, the 5,000 L CCV 500 Short and CCV 500 are KSh 50,830 in Zone 1, KSh 51,428 in Zone 2, KSh 52,624 in Zone 3, KSh 53,820 in Zone 4, KSh 55,016 in Zone 5, KSh 57,408 in Zone 6, KSh 58,604 in Zone 7 and KSh 59,800 in Zone 8, inclusive of VAT. Please provide the delivery town/location so I can identify the applicable zone. Kentainers reserves the right to change prices without notice.",sources:[{document:"ZONAL-KENTANK-PRICELIST-15.04.2026.pdf"}],action:"clarify"};
   return priceAnswer("5,000 L",["CCV 500 Short","CCV 500"],ccv["CCV 500"],zone);
 }
 if(is6000){
   if(zone===null) return {answer:"For the official Kentainers zonal price list effective 15 April 2026, the 6,000 L above-ground CCV 600 is priced by delivery zone. Please provide the delivery town/location so I can give the applicable price. Kentainers reserves the right to change prices without notice.",sources:[{document:"ZONAL-KENTANK-PRICELIST-15.04.2026.pdf"}],action:"clarify"};
   return priceAnswer("6,000 L",["CCV 600"],ccv["CCV 600"],zone);
 }
 if(isGrain){
   return {answer:"The official Kentainers Grain Silo product page currently lists the 500 L Grain Silo at KSh 11,307. The page states that the displayed price includes shipping to the selected zone. For a final quotation, confirm the customer's delivery location and current availability with Kentainers.",sources:[{document:"Kentainers Grain Silo product page"}],action:"details"};
 }
 if(/price\s*list|pricelist/.test(lower)) return {answer:"Kentainers publishes zonal price lists with VAT-inclusive prices. The latest official zonal Kentank price list I found is effective 15 April 2026 and covers eight delivery zones. Prices can change without notice. Ask me for a specific product and delivery location and I can identify the documented price.",sources:[{document:"ZONAL-KENTANK-PRICELIST-15.04.2026.pdf"}],action:"details"};
 return null;
}

function priceAnswer(capacity:string,products:string[],prices:number[],zone:number):AgentResult{
 const names=products.join(" and ");
 const amount=prices[zone].toLocaleString("en-KE");
 return {answer:`For ${capacity} above-ground water storage, the official 15 April 2026 Kentainers zonal price list gives ${names} at KSh ${amount} in ${zones[zone].name}, inclusive of VAT. The two 5,000 L variants have different dimensions but the same listed price. Kentainers reserves the right to change prices without notice; confirm the current quotation before ordering.`,sources:[{document:"ZONAL-KENTANK-PRICELIST-15.04.2026.pdf"}],action:"details"};
}
