import React from "react";
import Sidebar from "../components/Sidebar";
import DragDropGrid from "../components/DragDropGrid";
import "../css/Home.css"; // Reuse Home.css for layout styling

export default function DragDropPage() {
  return (
    <div className="dashboard-home">
      <Sidebar />
      <main className="main-home">
        <header className="header-main">
          <h1>Drag & Drop Demo</h1>
        </header>
        
        <section style={{ 
          padding: '20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          minHeight: 'calc(100vh - 100px)'
        }}>
        </section>
      </main>
    </div>
  );
}
