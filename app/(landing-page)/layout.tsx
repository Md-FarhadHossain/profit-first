import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import localFont from 'next/font/local'
import Script from "next/script";




const myFont = localFont({
  src: '../../public/ekkushe-lalshalu.ttf',
})

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "",
  description: "Profit first for f-commerce business in bangladesh book.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased ${myFont.className}`}
      >

         <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KJMR3RVK"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
     
        <Script id="google-tag-manager-head">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-KJMR3RVK');
          `}
        </Script>


        <Script strategy="afterInteractive">
  {`
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          setTimeout(() => {
            targetElement.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      });
    });
  `}
</Script>

        
        <ClerkProvider>{children}</ClerkProvider>

   
      </body>
    </html>
  );
}
