import { Placeholder } from "react-bootstrap";

const headers = [
  "KP broj",
  "Ime",
  "Prezime",
  "Grupa",
  "Mobitel",
  "Email",
  "Adresa rada",
];

const TechnicianListPlaceholder = () => {
  return (
    <div className="container-fluid" style={{ minHeight: '600px' }}>
      <h2 className="text-xl font-bold mb-4">
        <Placeholder animation="glow">
          <Placeholder xs={4} />
        </Placeholder>
      </h2>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead className="table-dark">
            <tr>
              {headers.map((header) => (
                <th key={header} className="border px-2 py-1">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, rowIdx) => (
              <tr key={rowIdx}>
                {Array.from({ length: headers.length }).map((_, colIdx) => (
                  <td key={colIdx} className="border px-2 py-1">
                    <Placeholder animation="glow">
                      <Placeholder xs={12} />
                    </Placeholder>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-3">
        <Placeholder.Button variant="secondary" xs={2} />
        <Placeholder animation="glow">
          <Placeholder xs={3} />
        </Placeholder>
        <Placeholder.Button variant="secondary" xs={2} />
      </div>
    </div>
  );
};

export default TechnicianListPlaceholder;
