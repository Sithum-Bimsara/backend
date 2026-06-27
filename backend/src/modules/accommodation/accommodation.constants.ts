export const PROPERTY_FACILITIES = [
  {
    title: "Most Popular",
    items: ["Free WiFi", "Swimming pool", "Beach", "Air conditioning", "Non-smoking rooms", "Airport shuttle"]
  },
  {
    title: "Food & Drink",
    items: ["Restaurant", "Room service", "Bar"]
  },
  {
    title: "Wellness",
    items: ["Sauna", "Fitness centre", "Spa and wellness centre", "Hot tub/Jacuzzi"]
  },
  {
    title: "General",
    items: [
      "24-hour front desk", "Garden", "Terrace", "Family rooms", 
      "Water park", "Electric vehicle charging station",
      "Elevator", "Heating", "Pet Friendly"
    ]
  }
];

export const ROOM_AMENITIES = [
  {
    title: "General amenities",
    items: ["Air conditioning", "Heating", "Wardrobe or closet", "Towels", "Linens", "Flat-screen TV"],
  },
  {
    title: "Outdoors and views",
    items: ["Balcony", "Terrace", "View"],
  },
  {
    title: "Food and drink",
    items: ["Tea/Coffee maker", "Refrigerator", "Electric kettle", "Kitchenware", "Dining table", "Dining area"],
  },
];

export const BED_CAPACITY: Record<string, number> = {
  twin: 2,
  full: 2,
  queen: 2,
  king: 2,
  sofa: 1,
  bunk: 2,
  futon: 1,
};
