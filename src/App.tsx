import './App.css';
import TechnicianForm from './components/TechnicianForm';
import TechnicianList from './components/TechnicianList';

function App() {
  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-start bg-light py-5">
      <div className="container py-4">
        <h1 className="text-center mb-5">Upravljanje Tehničarima</h1>
        <div className="row g-4">
          <div className="col-12 col-lg-6 p-4 shadow-sm rounded bg-white">
            <TechnicianForm />
          </div>
          <div className="col-12 col-lg-6 p-4 shadow-sm rounded bg-white">
            <TechnicianList />
          </div>
        </div>
      </div>

    </div>
  );
}

export default App;
