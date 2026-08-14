import { AssetStatus } from "./asset-status.enum";

export interface UpdateAssetStatusRequest {
    status: AssetStatus;
}