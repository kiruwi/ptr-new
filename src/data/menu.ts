export type MenuItem = {
  name: string;
  price: string;
};

export type MenuGroup = {
  title: string;
  items: MenuItem[];
  layout?: "table" | "lines";
  note?: string;
};

export type MenuCategory = {
  title: string;
  image: string;
  imageAlt: string;
  groups: MenuGroup[];
};

export const menuCategories: MenuCategory[] = [
  {
    title: "Starters",
    image: "/images/salad.webp",
    imageAlt: "Fresh avocado salad served in a bowl.",
    groups: [
      {
        title: "Soup",
        layout: "lines",
        items: [{ name: "Zucchini Soup", price: "5,000" }],
      },
      {
        title: "Salads",
        items: [
          { name: "Vegetable Salad", price: "5,000" },
          { name: "Cucumber & Tomato Salad", price: "5,000" },
          { name: "Avocado Salad", price: "5,000" },
          { name: "Fruit Plate", price: "5,000" },
        ],
      },
    ],
  },
  {
    title: "Desserts",
    image:
      "https://images.unsplash.com/photo-1555411093-7440ae076e89?auto=format&fit=crop&w=1600&q=80",
    imageAlt: "Fresh fruit salad served in a bowl.",
    groups: [
      {
        title: "Desserts",
        items: [
          { name: "Chocolate Mousse", price: "7,000" },
          { name: "Mango Mousse", price: "7,000" },
          { name: "Banana Mousse", price: "7,000" },
          { name: "Fruit Salad", price: "5,000" },
          { name: "Banana Fritter", price: "5,000" },
        ],
      },
    ],
  },
  {
    title: "Main Courses",
    image:
      "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=1600&q=80",
    imageAlt: "Mixed African main course platter with grilled meats.",
    groups: [
      {
        title: "Beef",
        items: [
          { name: "Beef Curry", price: "9,000" },
          { name: "Roasted Beef", price: "9,000" },
          { name: "Beef Stir Fry", price: "10,000" },
          { name: "Beef Pepper Steak", price: "10,000" },
          { name: "Grilled Beef", price: "10,000" },
        ],
      },
      {
        title: "Chicken",
        items: [
          { name: "Chicken Curry", price: "9,000" },
          { name: "Roasted Chicken", price: "9,000" },
          { name: "Rosemary Chicken", price: "10,000" },
          { name: "Stir Fry Chicken", price: "10,000" },
          { name: "Grilled Chicken", price: "10,000" },
          { name: "Organic Steamed Chicken (Kienyeji)", price: "30,000" },
        ],
      },
      {
        title: "Fish",
        items: [
          { name: "Steamed Fish", price: "10,000" },
          { name: "Pan Fried Fish", price: "10,000" },
          { name: "Fish Curry", price: "10,000" },
        ],
      },
      {
        title: "Pork",
        items: [
          { name: "Pork Curry", price: "9,000" },
          { name: "Roasted Pork", price: "9,000" },
          { name: "Stir Fry Pork", price: "10,000" },
          { name: "Grilled Pork", price: "10,000" },
        ],
      },
    ],
  },
  {
    title: "Pizza",
    image:
      "https://images.unsplash.com/photo-1566222499048-9538f86d4675?auto=format&fit=crop&w=1600&q=80",
    imageAlt: "Rustic sliced pizza in a casual bakery-style setting.",
    groups: [
      {
        title: "Pizza",
        items: [
          { name: "Margherita", price: "18,000" },
          { name: "Mushroom", price: "18,000" },
          { name: "Sausage", price: "18,000" },
          { name: "Chicken", price: "20,000" },
          { name: "Minced Beef", price: "20,000" },
          { name: "Beef", price: "20,000" },
        ],
        note: "Extra topping: +3,000",
      },
    ],
  },
  {
    title: "Burgers",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1600&q=80",
    imageAlt: "Grilled beef burger with fries on a plate.",
    groups: [
      {
        title: "Burgers",
        items: [
          { name: "Beef Burger", price: "15,000" },
          { name: "Chicken Burger", price: "15,000" },
          { name: "Cheese Burger", price: "17,000" },
        ],
      },
    ],
  },
  {
    title: "BBQ Grill",
    image:
      "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=1600&q=80",
    imageAlt: "Assorted grilled barbecue skewers and meat.",
    groups: [
      {
        title: "BBQ Grill",
        items: [
          { name: "Chicken Skewers", price: "5,000" },
          { name: "Beef Skewer", price: "5,000" },
          { name: "Beef BBQ (1kg)", price: "15,000" },
          { name: "Goat BBQ (1kg)", price: "20,000" },
          { name: "Chicken BBQ (Whole)", price: "32,000" },
        ],
      },
    ],
  },
  {
    title: "Sides",
    image: "/images/sides.webp",
    imageAlt: "Steamed rice and roasted potatoes served as sides.",
    groups: [
      {
        title: "Potatoes",
        layout: "lines",
        items: [
          { name: "Mashed Potatoes", price: "5,000" },
          { name: "French Fries", price: "5,000" },
          { name: "Roasted Wedges", price: "5,000" },
          { name: "Sauteed Potatoes", price: "5,000" },
        ],
      },
      {
        title: "Rice",
        layout: "lines",
        items: [
          { name: "Steamed Rice", price: "5,000" },
          { name: "Turmeric Rice", price: "5,000" },
          { name: "Vegetable Rice", price: "5,000" },
          { name: "Brown Rice", price: "5,000" },
        ],
      },
    ],
  },
];

export function toNumericPrice(price: string) {
  return price.replace(/,/g, "");
}
