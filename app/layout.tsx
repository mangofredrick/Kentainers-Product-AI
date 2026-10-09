import React from "react";

export const metadata = {
  title: "Kentainers Product & Services Virtual Assistant | ASTi Group",
  description: "Kentainers, an ASTi Group company: virtual assistance for products, services, technical guidance, pricing and customer enquiries.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{margin:0,fontFamily:"Arial, sans-serif",background:"#f5f7fa",color:"#17202a"}}>
        {children}
      </body>
    </html>
  );
}
