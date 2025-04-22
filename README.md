# Unos terenskog tehničara u bazu (HT) - Frontend

Ovaj projekt čini frontend dio tehničkog zadatka za intervju za poziciju Web Developera.

## Specifikacija zadatka

- Postoji više grupa, od kojih svaka ima svoga voditelja.

- Potrebno je izraditi web formu za unos tehničara s jasno definiranim poljima

- Pohraniti podatke u bazu podataka.

- Prikazati sve tehničare koji su trenutno pohranjeni u bazi.

- Implementirati cron job koji se izvršava svakih 1 minutu i:

  - provjerava postoje li tehničari u grupi 200,
  - automatski ih prebacuje u grupu 300.

## Tech stack

Frontend stack sastoji se od:
- React -JS biblioteka za gradnju UI komponenti, moderna i najšire korištena frontend biblioteka
- TypeScript - superset JavaScripta koji omogućuje type safety, smanjuje broj runtime errora i omogućuje jasnije razumijevanje i bolju skalabilnost na većim projektima
- Bootstrap - CSS framework koji nudi gotove UI komponente, lakšu responzivnost i grid sustav. Komponente već imaju osnovnu stilizaciju i lakše je napraviti aplikaciju koja ima smislen izgled nego „goli“ CSS
- Zod - TS biblioteka koja omogućuje deklaraciju schema i validaciju podataka. U ovom slučaju omogućuje validaciju forme da bi se na frontend razini spriječio unos krivih ili zlonamjernih podataka i lakši error handling
- React Hook Form - Koristi nekontrolirane komponente za bolju performanse (manje rerendera) i nudi jednostavan API za validaciju (može se integrirati sa Zod-om za type-safe validaciju), upravljanje stanjem forme i slanje podataka. Smanjuje boilerplate kod potreban za ručno upravljanje stanjem svakog input polja.

## Komponente

### TechnicianForm

Ova komponenta je frontend dio sustava za dodavanje novog tehničara.

Komponenta je u svojoj srži forma za unos podataka realizirana uz pomoć Zod schema validacije i React Hook Form za upravljanje formama.

#### React Hook Form hook

Većina kompleksnosti forme predana je dependency-ju react-hook-form koji omogućuje lakši rad s formama.

useForm je custom hook koji u sebi sadrži brojne metode i svojstva za baratanje formama. U ovoj slučaju korišteni su:
- control - kontrolni objekt zadužen za registraciju, validaciju i kontrolu stanja svakog polja forme
- handleSubmit - funkcija koja prima podatke forme ukoliko je validacija uspješna, kao argument uzima callback funkciju koja se onda brine za daljnju obradu i slanje podataka backendu
- formState - objekt koji sadržava brojne informacije o stateu svakog polja forme, omogućava opcionalno praćenje interakcije korisnika sa svakim poljem forme, a u našem slučaju praćenje i lakše baratanje errorima validacije
- setValue - omogućava dinamičko postavljanje vrijednosti registriranog polja, u našem slučaju postavlja vrijednost readonly polja voditelja kada se promijeni vrijednost dropdown polja za unos grupe
- watch - metoda koja prati specificirano polje, koristi se u useEffectu da bi pokrenuli useEffect koji mapira voditelja u polje kada se promijeni grupa u dropdownu
- reset - metoda koja resetira state i polja forme nakon nekog uvjeta, u ovom slučaju koristi se da se polja isprazne kada korisnik uspješno unese novog tehničara ili sam resetira formu gumbom.

Također, u definiciji hooka predaje mu se i konfiguracijski objekt:
- resolver - svojstvo koje omogućuje integraciju s vanjskim validacijskim bibliotekama, u ovom slučaju Zod, i korištenjem funkcije zodResolver validacijska schema se prevodi u format razumljiv RHF
- defaultValues - objekt koji definira default vrijednost svakog polja forme, u ovom slučaju sva polja koja su tekstualni unos su inicijalizirana na prazan string

#### Zod

Zod schema se u ovoj implementaciji gradi dinamički, nakon što se dohvate potrebni podaci o grupama i voditeljima. Funkcija buildTechnicianSchema kao argument dobija objekt tipa GroupManager. U funkciji se prvo iz objekta izvlači lista grupa i voditelja, koja se dalje koristi u gradnji scheme. Svako polje scheme definirano se uz ograničenja koja se tiču tipa podatka, potom se svaka vrijednost trima(miču se leading i trailing whitespaceovi), zatim se postavljaju ograničenja veličine, formata i naposlijetku za određena polja i validacijski regularni izrazi koji sprečavaju unos krivih ili čak zlonamjernih podataka pomoću forme. Za grupe i voditelje provjerava se jesu li u listi ponuđenih ako korisnik kojim slučajem uspije mimo dropdowna unijeti nepostojeću vrijednost.

#### Regularni izrazi

U validaciji podataka pomoću Zod-a koristi se nekoliko pomno dizajniranih regularnih izraza:
- Mobilni brojevi - regularni izraz ih prihvaća ako su u formatu hrvatskih mobilnih brojeva: mogu počinjati sa +385 ili 0 ovisno radi li se o međunarodnom ili lokalnom obliku, zatim jedan od validnih pozivnih brojeva operatera, i naposlijetku 6 ili 7 brojeva koji mogu biti odvojeni spaceom, crticom ili spojeni
- Imena ulica - regularni izraz ih prihvaća ako su u formatu: Jedna riječ (isključivo slova) sa dva ili više slova, i opcionalno više riječi sa jednim ili više slova
- Kućni brojevi - regularni izraz ih prihvaća ako su u jednom od tri moguća formata: 1-5 znamenaka, 1-5 znamenaka s opcionalnim jednim slovom na kraju, ili kraticu za kuću bez broja (bb)
- Poštanski broj - peteroznamenkasti broj, gdje je prva znamenka 1-5 budući da je to raspon postojećih poštanskih brojeva u Hrvatskoj
- Ime grada - regularni izraz ih prihvaća ako su u formatu: jedna ili više riječi odvojenih spaceom, može sadržavati crtice ili apostrofe

#### Slijed inicijalizacije forme

- Kao state varijable definirane su sljedeće:
  - groupManagers koja prati listu grupa i pripadajućih voditelja budući da nisu hardkodirane i dobavaljaju se u runtimeu
  - tri state varijable koje vode računa o statusu forme: isSubmitting, isSuccess, isError

- Inicijalizira se useForm state
- dohvaćaju se podaci o grupama i voditeljima, i na temelju njih se gradi validacijska schema
- useEffect mijenja vrijednost manager polja kada se promijeni groupId polje
- onSubmit je callback funkcija koja se prosljeđuje RHF handleSumbit funkciji kada je validacija uspješna: ažurira JSON polja da bi polje grupe bilo u potrebnom formatu da bi se kasnije u bazi upisalo kao strani ključ i briše se stara implementacija, state za učitavanje se postavi na istinitu vrijednost. Zatim se šalje POST zahtjev na API endpoint za spremanje tehničara s potrebnim headerima i tijelom zathjeva koji sadržava obrađene podatke forme. Ako je forma uspješna, state isSuccess se postavlja na istinitu vrijednost i forma se resetira, ako ne, ispisuje se error i state isError se postavlja na istinitu vrijednost.
- handleReset funkcija je dana kao argument event listenera gumba za resetiranje forme, poziva funkciju RHF za resetiranje forme i resetira state varijable

#### Prezentacijski dio forme

- Ukoliko grupe i voditelji nisu još dohvaćeni, umjesto forme se prikazuje
- Ukoliko su podaci dohvaćeni, prikazuje se forma
- Forma je obgrljena <form> tagom i prilikom prilikom klika na submit gumb event listener izvršava onSubmit funkciju
- Svako polje ima svoj label koji korisniku govori što to polje predstavlja
- Svako polje je <Controller> komponenta koja ima svoju identifikaciju i registrirano je u control objektu, render argument prikazuje što se treba prikazati na ekranu za to polje forme.
- Ispod svakog polja, ako se dogodi error pri validaciji, korisniku se kondicionalno ispisuje poruka koja služi da mu objasni gdje se dogodila greška i što je krivo upisano
- Na dnu forme nalaze se dva gumba, gdje je primarni za submit forme, koji radi bez ikakvog dodatnog koda budući da je tipa submit i RHF ga automatski prepoznaje, a drugi je za resetiranje forme
- Pored gumbova nalazi se indikator statusa forme nakon submita, koji se sastoji od tri kondicionalno renderirana polja u ovisnosti koja state varijabla je trenutno istinita: spinner s porukom koji označava čekanje na odgovor zahtjeva s formom, check i poruka ako je spremanje uspješno, x i poruka ako je spremanje neuspješno

### TechnicianList

Ova komponenta je frontend dio sustava za prikaz liste svih tehničara.

Zbog praktičnih razloga, budući da bi broj tehničara u stvarnom sustavu vjerojatno bio jako velik, lista svih tehničara izvedena je pomoću paginacije.

#### Opis rada komponente

Budući da se radi o komponenti koja samo ispisuje već postojeće podatke, nije potrebno oslanjati se na vanjske dependency-je, već je komponenta izvedena uz pomoć useState i useEffect funkcionalnosti samog React-a.
- Kao globalne varijable definirani su tipovi podataka i vrijednosti za ispis tablice kako bi prezentacijski dio komponente bio čitljiviji i kako bi se smanjilo ponavljanje koda:
  - Tipovi i imena podataka koji se očekuju kao element JSON niza koji će se dobiti u odgovoru na zahtjev poslan backendu, tip podatka za definiciju state varijable (niza) technicians
  - Imena stupaca prezentacijske tablice
  - Imena svojstava objekta za ispis u prezentacijskoj tablici
- Kao state varijable definirane su sljedeće:
  - Tehničari, niz, spremaju se podaci iz fetch odgovora
  - loading state za slučaj kada tehničari još nisu dohvaćeni
  - page i totalPages za paginaciju
- useEffect izvršava funkciju fetchTechnicians koja dobavlja paginiranu listu tehničara:
  - šalje se GET zahtjev na /api/admin/technicians uz dodatne parametre: page (dinamički određena trenutna stranica paginacije) i size (broj redaka iz tablice baze podataka tj. veličina stranice)
  - dohvaćeni podaci spremaju se u state varijable
  - useEffect se pokreće na mountu i svaki put kada se varijabla page promijeni
- handleNext i handlePrev funkcije mijenjaju vrijednost page state varijable, šalju se kao argumenti event listenera na kontrolne gumbe paginacije
- Ukoliko tehničari još nisu dohvaćeni, prikazuje se loading state poruka
- Tablica se uvijek inicijalizira kao pet redaka da bi se smanjio layout shift: techniciansWithEmptyRows prazne retke ukoliko zadnja stranica paginacije ima manje od pet elemenata za prikaz, u loading stateu prikazuje oblik tablice koji se može očekivati kada se podaci učitaju
- tablica se sastoji od mapiranih globalno definiranih nizova koristeći nativni <table> modul, sa svakim retkom stiliziranim
- Ispod tablice nalaze se kontrole za paginaciju i prikaz trenutne stranice od ukupnih. Na kontrolama su event listeneri koji kontroliraju koja stranica paginacije se trenutno prikazuje.