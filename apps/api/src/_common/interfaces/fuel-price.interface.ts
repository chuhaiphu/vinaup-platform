export interface VnexpressGasOilItem {
  price: number;
  diff: number;
  label: string;
}

export interface VnexpressGasOil {
  ron_95: VnexpressGasOilItem;
  e5_ron_92: VnexpressGasOilItem;
  dau_diesel: VnexpressGasOilItem;
  date_label: string;
}

// VNExpress wraps the payload in a double envelope: { code, data: { ..., data: { gas_oil } } }
export interface VnexpressFuelApiResponse {
  code: number;
  data: {
    data: {
      gas_oil: VnexpressGasOil;
    };
  };
}
