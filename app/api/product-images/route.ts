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
    const url = new URL("https://kentainers.co.ke/wp-json/wc/store/v1/products");
    url.searchParams.set("search", search);
    url.searchParams.set("per_page", "8");
    const response = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      return NextResponse.json({ products: [] }, { status: 200 });
    }

    const results = (await response.json()) as StoreProduct[];
    const products = results.map((product) => ({
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
