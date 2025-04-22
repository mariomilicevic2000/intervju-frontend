import './App.css';
import TechnicianForm from './components/TechnicianForm';
import TechnicianList from './components/TechnicianList';

function App() {
  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-start bg-light py-4 px-2">
      <div className="container-fluid px-md-5">
        <h1 className="text-center mb-4 display-6">Upravljanje Tehničarima</h1>
        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <div className="p-4 shadow-sm rounded bg-white h-100">
              <TechnicianForm />
            </div>
          </div>
          <div className="col-12 col-lg-6">
            <div className="p-4 shadow-sm rounded bg-white h-100">
              <TechnicianList />
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}

export default App;
