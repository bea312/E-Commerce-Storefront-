import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export const AppShell = () => (
  <div className="app-shell">
    <div className="app-shell__backdrop app-shell__backdrop--one" />
    <div className="app-shell__backdrop app-shell__backdrop--two" />
    <Navbar />
    <main className="container page-shell">
      <Outlet />
    </main>
  </div>
);

export default AppShell;
