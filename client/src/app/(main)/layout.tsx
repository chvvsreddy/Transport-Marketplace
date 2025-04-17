import DashboardWrapper from "./dashboardWrapper";

// export default function Layout({ children, }: Readonly<{ children: React.ReactNode;}>) {
//   return (
//     <html lang="en">
//       <body>
//         dashboard layout
//         {children}
//       </body>
//     </html>
//   );
// }

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardWrapper>{children}</DashboardWrapper>;
}
