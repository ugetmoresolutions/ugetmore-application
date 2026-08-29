import brandingBanner from "@/public/yougetmore assets/pictures/branding.png";
import electronicsBanner from "@/public/yougetmore assets/pictures/brandingBanner.png";
import stationaryBanner from "@/public/yougetmore assets/pictures/brandingBanner.png";
import furnitureBanner from "@/public/branding.png";
interface ShopConfig {
  title: string;
  banner: any;
  bannerAlt: string;
  categoryMatchers: string[];
}
export const SHOP_CONFIGS: Record<string, ShopConfig> = {
  branding: {
    title: "Branding",
    banner: brandingBanner,
    bannerAlt: "Branding products banner",
    categoryMatchers: []
  },
  electronics: {
    title: "Electronics",
    banner: electronicsBanner,
    bannerAlt: "Electronics products banner",
    categoryMatchers: [
      "technology", "tech accessories", "flash drives",
      "power banks", "earbuds", "headphones", "chargers",
      "wireless chargers", "usb hubs", "smart watches"
    ]
  },
  stationery: {
    title: "Office Stationery",
    banner: stationaryBanner,
    bannerAlt: "Office stationery products banner",
    categoryMatchers: [
      "stationery", "writing instruments", "notebooks",
      "folders", "pen sets", "highlighters", "pencils",
      "notepads", "diaries"
    ]
  },
  furniture: {
    title: "Furniture",
    banner: furnitureBanner,
    bannerAlt: "Furniture products banner",
    categoryMatchers: [
      "chairs", "home and living", "indoor products",
      "outdoor products", "gazebos", "parasols", "furniture"
    ]
  },
  shop: {
    title: "Shop",
    banner: brandingBanner,
    bannerAlt: "Shop products banner",
    categoryMatchers: []
  },
};