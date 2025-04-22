import { useEffect, useState } from "react";

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
  "Grupa",
  "Mobitel",
  "Email",
  "Adresa rada",
];

// vrijednosti retka tablice
const getTechValues = (tech: any) => [
  tech.kpNumber || "",
  tech.firstName || "",
  tech.lastName || "",
  tech.group?.managerName || "",
  tech.contactMobile || "",
  tech.contactEmail || "",
  `${tech.workStreetName || ""} ${tech.workStreetNumber || ""}, ${tech.workPostcode || ""} ${tech.workCity || ""}`,
];

const TechnicianList = () => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [inputValue, setInputValue] = useState(page+1);

  // paginacija
  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/admin/technicians?page=${page}&size=5`);
        if (!response.ok) throw new Error("Failed to fetch technicians");
        const data = await response.json();
        setTechnicians(data.content);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Error fetching technicians:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTechnicians();
  }, [page]);


  // logika za navigaciju paginacije
  const handleNext = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  const handlePrev = () => {
    if (page > 0) setPage(page - 1);
  };


  // tablica uvijek ima nizova koliko ima i stranica, smanjenje layout shifta
  const techniciansWithEmptyRows = [
    ...technicians,
    ...new Array(5 - technicians.length).fill({
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

  useEffect(() => {
    setInputValue(page + 1);
  }, [page]);

  const handleInputChange = (e : any) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    const newPage = Number(inputValue) - 1;
    if (!isNaN(newPage) && newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    } else {
      setInputValue(page + 1);
    }
  };

  const handleKeyDown = (e : any) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  if (loading) return <p>Učitavanje tehničara...</p>;

  return (
    <div className="p-4">
      {/* tablica generirana nizovima definiranima gore */}
      <h2 className="text-xl font-bold mb-4">Popis tehničara</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            {headers.map((header) => (
              <th key={header} className="border px-2 py-1">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {techniciansWithEmptyRows.map((tech, index) => (
            <tr key={tech.kpNumber || `empty-row-${index}`}>
              {getTechValues(tech).map((val, i) => (
                <td key={i} className="border px-2 py-1">
                  {val}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Kontrole za paginaciju */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <button className="btn btn-secondary" disabled={page === 0} onClick={handlePrev}>Prethodna</button>
        <span>Stranica </span>
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
        <span> od {totalPages}</span>
        <button className="btn btn-secondary" disabled={page === totalPages - 1} onClick={handleNext}>Sljedeća</button>
      </div>
    </div>
  );
};

export default TechnicianList;
