import DashboardWrapper from "./dashboardWrapper";
import "@ant-design/v5-patch-for-react-19";
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
