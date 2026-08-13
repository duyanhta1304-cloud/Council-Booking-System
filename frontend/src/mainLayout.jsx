import { Routes, Route } from 'react-router'
import Home from './pages/home'
import Search from './pages/facilitySearch'
import FacilityDetails from './pages/facilitydetails'
import { Link, useNavigate } from 'react-router'
import "./global.css"
function App() {
  return (
    <div style={{ height: '100%' }}>
      <TopBar />
      <main style={{ paddingTop: '64px' }}>
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/search" element={<Search />}></Route>
          <Route path="/details" element={<FacilityDetails />}></Route>
        </Routes>
      </main>
    </div>
  )
}

export default App


function TopBar() {
  const navigate = useNavigate()

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      boxSizing: 'border-box',
      backgroundColor: 'var(--color-primary-dark)',
      borderBottom: `1px solid var(--color-border)`,
      zIndex: 'var(--z-sticky)'
    }}>
      <Link to="/" style={{
        fontWeight: 700,
        fontSize: '18px',
        color: 'var(--color-primary-light)',
        textDecoration: 'none'
      }}>
        CoastLink Council
      </Link>

      <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <Link to="/search" style={{
          color: 'var(--color-text-on-dark)',
          textDecoration: 'none',
          fontSize: '14px'
        }}>
          Facilities
        </Link>

        <button
          onClick={() => navigate('/search')}
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-text-on-dark)',
            border: 'none',
            padding: '10px 20px',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background var(--transition-slow)'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-primary-hover)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-primary)'}
        >
          Book a facility
        </button>
      </nav>
    </header>
  )
}
