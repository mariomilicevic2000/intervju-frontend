import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import '../App.css';
import TechnicianFormPlaceholder from './TechnicianFormPlaceholder';


// Regex koji matcha hrvatske mobilne brojeve: pocinje sa pozivnim za drzavu ili lokaknim prefiksom (0), validira prefikse operatera,
// validira broj znamenaka (6 ili 7) opcionalno odvojenih spaceovima ili crticama
const croatianMobileRegex = /^(\+385|0)(91|92|95|97|98|99)[\s-]?\d{3}[\s-]?\d{3,4}$/;

// Regex koji matcha hrvatska imena ulica, barem 2 slova i onda jos rijeci koje mogu biti odvojene crticama ili spaceovima
const croatianStreetRegex = /^[A-Za-zČčĆćŽžŠšĐđ]{2,}(\s[A-Za-zČčĆčŽžŠšĐđ]{1,})*$/;

// Regex koji matcha sve moguce varijacije kucnih brojeva: broj, broj i slovo ili bb (bez broja)
const croataianStreetNumberRegex = /^\d{1,5}[A-Za-z]{0,1}$|^bb$/;

// Regex koji matcha ispravne hrvatske postanske brojeve: prva znamenka mora biti 1-5, i jos 4 znamenke iza toga
const croatianPostcodeRegex = /^[1-5]\d{4}$/;

// Regex koji matcha ispravne hrvatske gradove: string slova
const croatianTownRegex = /^[A-Za-zČĆŽŠĐčćžšđ\s\-']+$/

const defaultTechnicianValues = {
  kpNumber: "",
  firstName: "",
  lastName: "",
  groupId: 100,
  manager: "",
  contactMobile: "",
  contactEmail: "",
  workStreetName: "",
  workStreetNumber: "",
  workPostcode: "",
  workCity: "",
}

// s obzirom da je u realnim situacijama nemoguce hardkodirati podatke o grupama i voditeljima i da se mogu bilo kad promijeniti,
// ova funkcija na mountu gradi schemu nakon sto dohvati mapirane podatke grupa i njihovih voditelja
const buildTechnicianSchema = (groupManagers: GroupManager[]) => {
  const validGroupIds = groupManagers.map((gm) => gm.groupId);
  const validManagers = groupManagers.map((gm) => gm.managerName);


  return z.object({
    kpNumber: z.string().min(3).max(10),

    firstName: z
      .string()
      .trim()
      .min(2, { message: "Ime mora imati barem 2 slova" })
      .refine((val) => val.length > 0, { message: "Ime ne može biti prazno" }),

    lastName: z
      .string()
      .trim()
      .min(2, { message: "Prezime mora imati barem 2 slova" })
      .refine((val) => val.length > 0, { message: "Prezime ne može biti prazno" }),

    groupId: z
      .number()
      .transform(val => Number(val))
      .refine((val) => validGroupIds.includes(val), {
        message: "Odaberite valjanu MFG grupu",
      }),

    manager: z
      .string()
      .refine((val) => validManagers.includes(val), {
        message: "Odaberite valjanog voditelja",
      }),

    contactMobile: z.string().trim().regex(croatianMobileRegex, {
      message: "Unesite ispravan hrvatski mobilni broj",
    }),

    contactEmail: z.string().trim().email(),

    workStreetName: z.string().trim().regex(croatianStreetRegex, {
      message: "Unesite ispravnu hrvatsku adresu",
    }),

    workStreetNumber: z.string().trim().min(1).max(5).regex(croataianStreetNumberRegex),

    workPostcode: z.string().trim().regex(croatianPostcodeRegex, {
      message: "Unesite ispravan poštanski broj",
    }),

    workCity: z.string().trim().regex(croatianTownRegex, {
      message: "Unesite ispravno ime naselja",
    }),
  });
};

type GroupManager = {
  groupId: number,
  managerName: string;
};

export default function TechnicianForm() {
  const [groupManagers, setGroupManagers] = useState<GroupManager[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [kpExists, setKpExists] = useState<boolean>(false);

  // dinamicki generirana schema
  const schema = buildTechnicianSchema(groupManagers);

  const { control, handleSubmit, formState: { errors }, setError, clearErrors, setValue, watch, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultTechnicianValues
  });

  // dohvacanje managera da bi se moglo populirati dropdown za postojece grupe
  useEffect(() => {
    fetch('http://localhost:8080/api/admin/groupmanagers')
      .then(res => res.json())
      .then(data => setGroupManagers(data))
      .catch(err => console.error("Dohvaćanje voditelja neuspješno", err))
  }, [watch]);

  // resetiranje statea forme i svih state varijabli
  const handleReset = () => {
    reset(defaultTechnicianValues);
    setIsSubmitting(false);
    setIsSuccess(false);
    setIsError(false);
    setKpExists(false);
  }


  const groupId = Number(watch("groupId"));

  // logika koja na temelju izabrane grupe mijenja readonly polje za managera
  useEffect(() => {
    const match = groupManagers.find((gm) => gm.groupId === groupId);
    // console.log("Selected groupId:", groupId, "-> Found manager:", match?.managerName);
    if (match) {
      setValue('manager', match.managerName);
    }
  }, [groupId, groupManagers, handleReset]);

  // funkcija koju aktivira blur event KP broj polja, provjerava postoji li taj KP broj vec u bazi, omogucava ispis errora
  const checkKpNumberExists = async (kpNumber: string) => {
    setKpExists(false);
    try {
      const res = await fetch(`http://localhost:8080/api/admin/technicians/check-kp/${kpNumber}`);
      const exists = await res.json();

      if (exists === true) {
        setError("kpNumber", {
          type: "manual",
          message: "KP broj je već u upotrebi",
        });
        setKpExists(true);
      } else {
        clearErrors("kpNumber");
      }
    } catch (error) {
      console.error("Greška prilikom provjere KP broja:", error);
    }
  };

  // slanje tehnicara preko API endpointa i logika za pokazatelj statusa submita
  const onSubmit = async (data: any) => {
    // manipulacija response bodya da bi se groupId poslao kao strani kljuc
    const updatedData = {
      ...data,
      group: { groupId: Number(data.groupId) },
    };
    delete updatedData.groupId;

    setIsSubmitting(true);
    setIsSuccess(false);
    setIsError(false);

    console.log(updatedData);

    try {
      const response = await fetch('http://localhost:8080/api/admin/technicians', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error('Greška prilikom spremanja');

      // alert('Tehničar uspješno spremljen!');
      setIsSuccess(true);
      reset(defaultTechnicianValues);
    } catch (error) {
      setIsError(true);
      console.error(error);
      // alert('Dogodila se greška');
    } finally {
      setIsSubmitting(false);
    }
  };

  // loading state skeleton dok se ne dohvate svi dinamicki podaci (grupe i voditelji)
  if (groupManagers.length === 0) {
    return (
      <TechnicianFormPlaceholder />
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='container-fluid mt-4'>
      <h1 className='mb-3'>Forma za unos novog tehnicara</h1>
      <div className="mb-3">
        <label htmlFor="kpNumber" className="form-label">KP broj</label>
        <Controller
          name="kpNumber"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              className="form-control"
              onBlur={(e) => {
                field.onBlur();
                checkKpNumberExists(e.target.value);
              }}
            />
          )}
        />
        {watch("kpNumber") && errors.kpNumber && (
          <p className="text-danger mt-1">{errors.kpNumber.message}</p>
        )}
      </div>

      <div className="row">
        <div className="col-12 col-md-6 mb-3">
          <label htmlFor="fullName" className="form-label">Ime</label>
          <Controller
            name="firstName"
            control={control}
            render={({ field }) => <input {...field} className="form-control" />}
          />
          {errors.firstName && <p className="text-danger">{errors.firstName.message}</p>}
        </div>

        <div className="col-12 col-md-6 mb-3">
          <label htmlFor="lastName" className="form-label">Prezime</label>
          <Controller
            name="lastName"
            control={control}
            render={({ field }) => <input {...field} className="form-control" />}
          />
          {errors.lastName && <p className="text-danger">{errors.lastName.message}</p>}
        </div>
      </div>


      <div className='row'>
        <div className="col-12 col-md-6 mb-3">
          <label htmlFor="groupId" className="form-label">MFG Grupa</label>
          <Controller
            name="groupId"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="form-select"
                id="groupId"
                onChange={e => field.onChange(Number(e.target.value))}
              >
                {groupManagers.map((gm) => (
                  <option key={gm.groupId} value={gm.groupId.toString()}>
                    {`${gm.groupId}`}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.groupId && <p className="text-danger">{errors.groupId.message}</p>}
        </div>
        <div className='col-12 col-md-6 mb-3'>
          <label htmlFor="manager" className="form-label">MFG Voditelj</label>
          <Controller
            key={groupId}
            name="manager"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                id="manager"
                className="form-control bg-light"
                readOnly
                tabIndex={-1}
              />
            )}
          />
        </div>

      </div>

      <div className="row">
        <div className="col-12 col-md-6 mb-3">
          <label htmlFor="contactMobile" className="form-label">Kontakt mobitel</label>
          <Controller
            name="contactMobile"
            control={control}
            render={({ field }) => (
              <input
                type="tel"
                className="form-control"
                id="contactMobile"
                {...field}
              />
            )}
          />
          {errors.contactMobile && <p className="text-danger">{errors.contactMobile.message}</p>}
        </div>

        <div className="col-12 col-md-6 mb-3">
          <label htmlFor="contactEmail" className="form-label">Kontakt e-mail</label>
          <Controller
            name="contactEmail"
            control={control}
            render={({ field }) => (
              <input
                type="email"
                className="form-control"
                id="contactEmail"
                {...field}
              />
            )}
          />
          {errors.contactEmail && <p className="text-danger">{errors.contactEmail.message}</p>}
        </div>
      </div>

      <h5 className="mt-4">Adresa rada</h5>
      <div className="row">
        <div className="col-12 col-md-6 mb-3">
          <label htmlFor="workStreetName" className="form-label">Ulica</label>
          <Controller
            name="workStreetName"
            control={control}
            render={({ field }) => (
              <input
                type="text"
                className="form-control"
                id="workStreetName"
                {...field}
              />
            )}
          />
          {errors.workStreetName && <p className="text-danger">{errors.workStreetName.message}</p>}
        </div>

        <div className="col-12 col-md-6 mb-3">
          <label htmlFor="workStreetNumber" className="form-label">Kućni broj</label>
          <Controller
            name="workStreetNumber"
            control={control}
            render={({ field }) => (
              <input
                type="text"
                className="form-control"
                id="workStreetNumber"
                {...field}
              />
            )}
          />
          {errors.workStreetNumber && <p className="text-danger">{errors.workStreetNumber.message}</p>}
        </div>
      </div>

      <div className="row">
        <div className="col-12 col-md-6 mb-3">
          <label htmlFor="workPostcode" className="form-label">Poštanski broj</label>
          <Controller
            name="workPostcode"
            control={control}
            render={({ field }) => (
              <input
                type="text"
                className="form-control"
                id="workPostcode"
                {...field}
              />
            )}
          />
          {errors.workPostcode && <p className="text-danger">{errors.workPostcode.message}</p>}
        </div>

        <div className="col-12 col-md-6 mb-3">
          <label htmlFor="workCity" className="form-label">Grad</label>
          <Controller
            name="workCity"
            control={control}
            render={({ field }) => (
              <input
                type="text"
                className="form-control"
                id="workCity"
                {...field}
              />
            )}
          />
          {errors.workCity && <p className="text-danger">{errors.workCity.message}</p>}
        </div>
      </div>


      {/* kontrole forme i pokazatelji statusa submita */}
      <button type='submit' className='btn btn-primary' disabled={kpExists}>Spremi tehničara</button>
      <button type='button' className='btn btn-secondary ms-3' onClick={handleReset}>Resetiraj formu</button>
      <div className="d-inline-block ms-3">
        {isSubmitting && (
          <>
            <FaSpinner className="text-primary spinner-border spinner-border-sm" />
            <span className="text-primary ms-1">Spremanje u tijeku...</span>
          </>
        )}
        {isSuccess && (
          <>
            <FaCheckCircle className="text-success" />
            <span className="text-success ms-1">Uspješno spremljeno</span>
          </>
        )}
        {isError && (
          <>
            <FaTimesCircle className="text-danger" />
            <span className="text-danger ms-1">Došlo je do pogreške</span>
          </>
        )}
      </div>
    </form >
  );
}

