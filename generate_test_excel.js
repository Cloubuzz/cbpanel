import XLSX from 'xlsx';

const data = [
  {
    ID: 4096,
    OutletID: 64,
    Area: "Test Area",
    Minimum: 299,
    DeliveryFe: 0,
    DeliveryTi: 30,
    Created: "2026-06-16 14:04:18",
    Modified: "2026-06-16 14:04:18",
    Discount: 0,
    startTime: "0:00",
    endTime: "0:00",
    onHold: 0,
    IsSponsor: 0,
    SponsorEx: "2026-06-16 14:04:18",
    OriginalID: 30,
    Name: "Test",
    CitySpecia: "Karachi",
    IsBranch: 0
  },
  {
    ID: 4097,
    OutletID: 64,
    Area: "Test Area 1",
    Minimum: 299,
    DeliveryFe: 0,
    DeliveryTi: 30,
    Created: "2026-06-16 14:04:18",
    Modified: "2026-06-16 14:04:18",
    Discount: 0,
    startTime: "0:00",
    endTime: "0:00",
    onHold: 0,
    IsSponsor: 0,
    SponsorEx: "2026-06-16 14:04:18",
    OriginalID: 30,
    Name: "Test",
    CitySpecia: "Karachi",
    IsBranch: 0
  },
  {
    ID: 4098,
    OutletID: 64,
    Area: "Test Area 2",
    Minimum: 299,
    DeliveryFe: 0,
    DeliveryTi: 30,
    Created: "2026-06-16 14:04:18",
    Modified: "2026-06-16 14:04:18",
    Discount: 0,
    startTime: "0:00",
    endTime: "0:00",
    onHold: 0,
    IsSponsor: 0,
    SponsorEx: "2026-06-16 14:04:18",
    OriginalID: 30,
    Name: "Test",
    CitySpecia: "Karachi",
    IsBranch: 0
  }
];

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
XLSX.writeFile(wb, "test_delivery_areas.xlsx");
console.log("Excel file generated successfully.");
