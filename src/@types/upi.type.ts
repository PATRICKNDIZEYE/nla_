interface ILandUse {
  landUseId: number;
  landUseTypeNameKinyarwanda: string;
  landUseTypeNameEnglish: string;
  landUseTypeNameFrench: string;
  endDate: string | null;
  leaseTerm: number;
}

interface ITenure {
  rightTypeId: string;
  rightTypeName: string;
  rightTypeCategory: string;
  rightTypeKind: string;
  isInquiry: boolean;
  onCertificate: boolean;
}

interface IAddress {
  villageName: string;
  villageId: string;
  cellName: string;
  cellId: string;
  sectorName: string;
  sectorId: string;
  districtName: string;
  districtId: string;
  provinceNameEnglish: string;
  provinceNameKinyarwanda: string;
  provinceNameFrench: string;
  provinceId: string;
  string: string;
}

interface ILandOwner {
  fullName: string;
  idNo: string;
  idTypeName: string;
  countryName: string;
  sharePercentage: string;
}

interface ParcelLocation {
  village: {
    villageCode: string;
    villageName: string;
  };
  cell: {
    cellCode: string;
    cellName: string;
  };
  sector: {
    sectorCode: string;
    sectorName: string;
  };
  district: {
    districtCode: string;
    districtName: string;
  };
  province: {
    provinceCode: string;
    provinceName: string;
  };
}

interface ILandData {
  landUseNameKinyarwanda: string;
  owners: ILandOwner[];
  upi: string;
  area: number;
  rightTypeId: string;
  landUseTypeId: number;
  startTransactionId: string;
  endTransactionId: string | null;
  startLeaseTransactionId: string;
  startDate: string;
  isProvisional: boolean;
  land_use_type_id: number;
  right_type_id: string;
  landUse: ILandUse;
  landUseId: number;
  landUseTypeNameKinyarwanda: string;
  landUseTypeNameEnglish: string;
  landUseTypeNameFrench: string;
  endDate: string | null;
  leaseTerm: number;
  tenure: ITenure;
  rightTypeName: string;
  rightTypeCategory: string;
  rightTypeKind: string;
  isInquiry: boolean;
  onCertificate: boolean;
  inTransaction: boolean;
  villageName: string;
  villageId: string;
  cellName: string;
  sectorName: string;
  districtName: string;
  provinceNameEnglish: string;
  provinceNameKinyarwanda: string;
  provinceNameFrench: string;
  address: IAddress;
  cellId: string;
  sectorId: string;
  districtId: string;
  provinceId: string;
  string: string;
  parcelLocation: ParcelLocation;
}

interface ILandResponse {
  success: boolean;
  found: boolean;
  data: ILandData;
}
