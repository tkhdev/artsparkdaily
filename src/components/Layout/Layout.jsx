// src/components/Layout.jsx
import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";

export default function Layout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
