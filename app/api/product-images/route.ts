import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 3600;

type StoreProduct = {
  id?: number;
  name?: string;
  slug?: string;
  permalink?: string;
  images?: Array<{ src?: string; alt?: string; name?: string }>;
};

export async function GET(request: NextRequest) {
  const search = (request.nextUrl.searchParams.get("search") || "").trim();
  if (!search) {
    return NextResponse.json({ products: [] });
  }

  try {
    const base = "https://kentainers.co.ke/wp-json/wc/store/v1/products";
    const headers = { Accept: "application/json" };
    const fetchProducts = async (query?: string): Promise<StoreProduct[]> => {
      const url = new URL(base);
      if (query) url.searchParams.set("search", query);
      url.searchParams.set("per_page", "100");
      const response = await fetch(url.toString(), {
        headers,
        next: { revalidate: 3600 }
      });
      if (!response.ok) return [];
      const body = await response.json();
      return Array.isArray(body) ? body as StoreProduct[] : [];
    };

    // WooCommerce's search can miss products when customers use a capacity,
    // abbreviation, or a different display name. Try the exact phrase first,
    // then match against the full public shop catalogue.
    let results = await fetchProducts(search);
    if (!results.length) results = await fetchProducts();

    const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    const terms = normalize(search).split(" ").filter(term => term.length > 1);
    const ranked = results.map(product => {
      const name = normalize(product.name || "");
      const score = terms.reduce((total, term) => total + (name.includes(term) ? 1 : 0), 0);
      return { product, score };
    }).filter(item => item.product.name && item.product.images?.[0]?.src)
      .sort((a, b) => b.score - a.score);

    const exact = ranked.filter(item => normalize(item.product.name || "") === normalize(search));
    const selected = (exact.length ? exact : ranked.filter(item => item.score > 0)).slice(0, 8);
    const products = selected.map(({ product }) => ({
      id: product.id,
      name: product.name || "",
      permalink: product.permalink || "",
      imageUrl: product.images?.[0]?.src || "",
      imageAlt: product.images?.[0]?.alt || product.name || "Kentainers product"
    })).filter(product => product.name && product.imageUrl);

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Kentainers product image lookup failed", error);
    return NextResponse.json({ products: [] }, { status: 200 });
  }
}
