import { CategoryResponse } from "../category/category-response.model";
import { AssetStatus } from "./asset-status.enum";

export interface AssetResponse {
  technicalId: string;
  inventoryFolio: string;
  serialNumber: string;
  brand: string;
  model: string;
  status: AssetStatus;
  acquisitionCost: number;
  entryDate: String;
  category: CategoryResponse;
}