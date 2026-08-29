import NavigationHeader from "@/components/common/Header";
import Footer from "@/components/common/Footer";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="">
             {children}
          
    </div>
  );
}
