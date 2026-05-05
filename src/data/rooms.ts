export type RoomImage = {
  src: string;
  alt: string;
};

export type RoomSuite = {
  slug: "single" | "double" | "triple";
  title: string;
  shortLabel: string;
  priceFrom: string;
  features: string[];
  description: string;
  images: RoomImage[];
};

export const roomSuites: RoomSuite[] = [
  {
    slug: "single",
    title: "Single Suite",
    shortLabel: "Single",
    priceFrom: "120,000",
    features: ["Sleeps 1", "Private bath", "Wi-Fi", "Breakfast"],
    images: [
      {
        src: "/images/single-suite.webp",
        alt: "Single suite room with a four-poster bed and mosquito net.",
      },
      {
        src: "/images/single-suite2.webp",
        alt: "Single suite interior with bed, wood furniture, and natural light.",
      },
      {
        src: "/images/single-suite3.webp",
        alt: "Single suite room view with bed and warm lodge interior details.",
      },
    ],
    description:
      "A peaceful retreat for solo travelers with a spacious bed, warm finishes, and a calm lodge atmosphere after a day in Karatu.",
  },
  {
    slug: "double",
    title: "Double Suite",
    shortLabel: "Double",
    priceFrom: "180,000",
    features: ["Sleeps 2", "Private bath", "Wi-Fi", "Breakfast"],
    images: [
      {
        src: "/images/double-suite.webp",
        alt: "Double suite with two beds, wood finishes, and bright natural light.",
      },
      {
        src: "/images/double-suite2.webp",
        alt: "Double suite room with twin beds and mosquito netting.",
      },
      {
        src: "/images/double-suite3.webp",
        alt: "Double suite bedroom with bright windows and lodge furniture.",
      },
      {
        src: "/images/double-suite4.webp",
        alt: "Double suite with neatly dressed twin beds and woven floor mat.",
      },
    ],
    description:
      "Ideal for couples or shared stays, with comfortable twin sleeping arrangements, bright interiors, and the same quiet lodge character.",
  },
  {
    slug: "triple",
    title: "Triple Suite",
    shortLabel: "Triple",
    priceFrom: "240,000",
    features: ["Sleeps 3", "Private bath", "Wi-Fi", "Breakfast"],
    images: [
      {
        src: "/images/tripple-suite.webp",
        alt: "Triple suite with multiple beds arranged for a group stay.",
      },
      {
        src: "/images/tripple-suite2.webp",
        alt: "Triple suite interior arranged for a family or small group stay.",
      },
    ],
    description:
      "Perfect for families or small groups, offering extra sleeping space, warm wood touches, and a relaxed room layout for longer stays.",
  },
];
