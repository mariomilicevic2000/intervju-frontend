import { useEffect, useState } from "react";

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

const TechnicianList = () => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

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

  const handleNext = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  const handlePrev = () => {
    if (page > 0) setPage(page - 1);
  };

  if (loading) return <p>Učitavanje tehničara...</p>;

  // Ensure the table always has 5 rows
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

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Popis tehničara</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">KP broj</th>
            <th className="border px-2 py-1">Ime</th>
            <th className="border px-2 py-1">Prezime</th>
            <th className="border px-2 py-1">Grupa</th>
            <th className="border px-2 py-1">Mobitel</th>
            <th className="border px-2 py-1">Email</th>
            <th className="border px-2 py-1">Adresa rada</th>
          </tr>
        </thead>
        <tbody>
          {techniciansWithEmptyRows.map((tech, index) => (
            <tr key={tech.kpNumber || `empty-row-${index}`}>
              <td className="border px-2 py-1">{tech.kpNumber || ""}</td>
              <td className="border px-2 py-1">{tech.firstName || ""}</td>
              <td className="border px-2 py-1">{tech.lastName || ""}</td>
              <td className="border px-2 py-1">{tech.group.managerName || ""}</td>
              <td className="border px-2 py-1">{tech.contactMobile || ""}</td>
              <td className="border px-2 py-1">{tech.contactEmail || ""}</td>
              <td className="border px-2 py-1">
                {tech.workStreetName || ""} {tech.workStreetNumber || ""}, {tech.workPostcode || ""} {tech.workCity || ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="d-flex justify-content-between align-items-center mt-3">
        <button className="btn btn-secondary" disabled={page === 0} onClick={handlePrev}>Prethodna</button>
        <span>Stranica {page + 1} od {totalPages}</span>
        <button className="btn btn-secondary" disabled={page === totalPages - 1} onClick={handleNext}>Sljedeća</button>
      </div>
    </div>
  );
};

export default TechnicianList;
