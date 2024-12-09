import districts from "../rwanda/districts.json";
import sectors from "../rwanda/sectors.json";
import cells from "../rwanda/cells.json";

export default class Address {
  public static getDistricts() {
    return districts.map(({ name, id }) => ({
      name,
      id,
    }));
  }

  public static getDistrict(id: string) {
    return districts.find((district) => district.id === id);
  }

  public static getSectors(districtId: string) {
    return sectors
      .filter((sector) => sector.district === districtId)
      .map(({ name, id }) => ({
        name,
        id,
      }));
  }

  public static getSector(id: string) {
    return sectors.find((sector) => sector.id === id);
  }

  public static getCells(sectorId: string) {
    return cells
      .filter((cell) => cell.sector === sectorId)
      .map(({ name, id }) => ({
        name,
        id,
      }));
  }

  public static getCell(id: string) {
    return cells.find((cell) => cell.id === id);
  }
}
