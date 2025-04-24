import { useEffect, useState } from "react";
import TechnicianListPlaceholder from "./TechnicianListPlaceholder";

// model podataka za tehničara
type Technician = {
  kpNumber: number;
  firstName: string;
  lastName: string;
  group: {
    groupId: number;
    managerName: string;
  };
  contactMobile: string;
  contactEmail: string;
  workStreetName: string;
  workStreetNumber: string;
  workPostcode: string;
  workCity: string;
};

// niz stupaca za tablicu
const headers = [
  "KP broj",
  "Ime",
  "Prezime",
  "MFG Grupa",
  "MFG Voditelj",
  "Mobitel",
  "Email",
  "Adresa rada",
];

// vrijednosti retka tablice
const getTechValues = (tech: any) => [
  tech.kpNumber || "",
  tech.firstName || "",
  tech.lastName || "",
  tech.group?.groupId || "",
  tech.group?.managerName || "",
  tech.contactMobile || "",
  tech.contactEmail || "",
  `${tech.workStreetName || ""} ${tech.workStreetNumber || ""}, ${tech.workPostcode || ""} ${tech.workCity || ""}`,
];

const TechnicianList = () => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [inputValue, setInputValue] = useState<number>(page + 1);
  const size: number = 5;

  // paginacija
  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/admin/technicians?page=${page}&size=${size}`);
        if (!response.ok) throw new Error("Failed to fetch technicians");
        const data = await response.json();
        setTechnicians(data.content);
        setTotalPages(data.totalPages);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching technicians:", error);
      }
    };

    fetchTechnicians();
  }, [page, size]);


  // tablica uvijek ima nizova koliko ima i stranica, smanjenje layout shifta
  const techniciansWithEmptyRows = [
    ...technicians,
    ...new Array(size - technicians.length).fill({
      kpNumber: null,
      firstName: "",
      lastName: "",
      group: { groupId: null, managerName: "" },
      contactMobile: "",
      contactEmail: "",
      workStreetName: "",
      workStreetNumber: "",
      workPostcode: "",
      workCity: "",
    }),
  ];

  // logika za navigaciju paginacije naprijed i nazad
  const handleNext = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  const handlePrev = () => {
    if (page > 0) setPage(page - 1);
  };

  // sinkronizacija kada se koriste gumbi za paginaciju, sinkronizira input polje
  useEffect(() => {
    setInputValue(page + 1);
  }, [page]);


  const handleInputChange = (e: any) => {
    setInputValue(e.target.value);
  };

  //pri bluru postavlja novu stranicu ako je vrijednost u ispravnom intervalu
  const handleInputBlur = () => {
    const newPage = Number(inputValue) - 1;
    if (!isNaN(newPage) && newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    } else {
      setInputValue(page + 1);
    }
  };

  // event listener koji omogucava da enter blura polje inputa za paginaciju
  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };


  // loading state skeleton
  if (loading) return <TechnicianListPlaceholder />;

  return (
    <div className="container-fluid" style={{ minHeight: '600px' }}>
      {/* tablica generirana nizovima definiranima gore */}
      <h2 className="text-xl font-bold mb-4">Popis tehničara</h2>
      <div className="table-responsive" style={{ minHeight: '600px' }}>
        <table className="table table-striped table-hover" style={{ tableLayout: "fixed", width: "100%" }}>
          <thead className="table-dark">
            <tr>
              {headers.map((header, idx) => (
                <th key={header} className="border px-2 py-1 text-nowrap" style={{
                  width: [
                    "100px", // KP broj
                    "120px", // Ime
                    "120px", // Prezime
                    "80px",  // Grupa
                    "140px", // Voditelj
                    "140px", // Mobitel
                    "200px", // Email
                    "280px", // Adresa rada
                  ][idx]
                }}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {techniciansWithEmptyRows.map((tech, index) => (
              <tr key={tech.kpNumber || `empty-row-${index}`}>
                {getTechValues(tech).map((val, i) => (
                  <td key={i} title={val} className="border px-2 py-1 text-truncate" style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Kontrole za paginaciju */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <button className="btn btn-secondary" disabled={page === 0} onClick={handlePrev}>Prethodna</button>
        <span>Stranica
          <input
            type="number"
            min={1}
            max={totalPages}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            className="form-control d-inline-block"
            style={{ width: '60px', display: 'inline-block', textAlign: 'center' }}
          />
          od {totalPages}</span>
        <button className="btn btn-secondary" disabled={page === totalPages - 1} onClick={handleNext}>Sljedeća</button>
      </div>
    </div>
  );
};

export default TechnicianList;
