import Link from "next/link";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div
      className="bg-cover bg-center min-h-screen flex flex-col items-center justify-center"
      style={{ backgroundImage: "url(/cover-image.svg)" }}
    >
      <div className="container mx-auto text-center pt-[32rem]">
        {children}
        <Link href="/">
          <button className="bg-[#FFBE98] hover:bg-white hover:text-red-300 text-white font-bold py-2 px-4 rounded mt- hover:border-red-300 hover:border-2">
            Get Started
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Layout;
