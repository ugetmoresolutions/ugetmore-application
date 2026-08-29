import CatalogueSection from "@/components/Home/CatalogueSection";
import BackToSchoolBanner from "../components/Home/BackToSchoolBanner";
import BestsellingCarousel from "../components/Home/BestSelling";
import HeroCarousel from "../components/Home/HeroSection";
import ShopByCategory from "../components/Home/ShopByCategory";
import BackToSchoolStationeryBanner from "@/components/Home/BackToSchoolStationeryBanner";


export default function Home() {
  return (
    <>
      <HeroCarousel />
      
      <ShopByCategory />
      <BackToSchoolStationeryBanner/>
      <BestsellingCarousel/>
       <CatalogueSection />
      <BackToSchoolBanner/>
      
    </>
  );
}
