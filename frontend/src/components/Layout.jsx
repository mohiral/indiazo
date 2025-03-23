import { Outlet } from "react-router-dom"
import Navbar from "./Navbar"

const Layout = () => (
  <div className="flex flex-col min-h-screen w-full">
    <div className="w-full flex flex-col flex-grow">
      <Navbar />
      <main className="flex-grow overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  </div>
)

export default Layout

