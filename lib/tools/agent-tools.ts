import { z } from "zod";
import { findProducts, getProductDetails } from "./products";
import { retrieveCatalogue } from "../rag/retriever";
export const findProductsTool={name:"find_products",description:"Find Kentainers products matching a customer requirement using the structured catalogue.",parameters:z.object({query:z.string().min(2),limit:z.number().int().min(1).max(10).default(5)}),execute:async({query,limit}:{query:string;limit:number})=>findProducts(query,limit)};
export const getProductDetailsTool={name:"get_product_details",description:"Retrieve exact structured details for a Kentainers product code or product name.",parameters:z.object({identifier:z.string().min(1)}),execute:async({identifier}:{identifier:string})=>getProductDetails(identifier)};
export const retrieveCatalogueTool={name:"retrieve_catalogue",description:"Retrieve source-backed Kentainers catalogue passages for factual grounding.",parameters:z.object({query:z.string().min(2)}),execute:async({query}:{query:string})=>retrieveCatalogue(query)};
