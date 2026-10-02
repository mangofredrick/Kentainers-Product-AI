import React from "react";

export const metadata = {
  title: "Kentainers Product Intelligence Agent",
  description: "Grounded Kentainers product selection assistant",
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
