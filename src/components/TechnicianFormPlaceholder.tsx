import { Placeholder } from 'react-bootstrap';

export default function TechnicianFormPlaceholder() {
    return (
        <div className="container-fluid mt-4">
            <h1 className="mb-3"><Placeholder animation="glow"><Placeholder xs={6} /></Placeholder></h1>

            <div className="mb-3">
                <label className="form-label">KP broj</label>
                <Placeholder animation="glow">
                    <Placeholder xs={12} />
                </Placeholder>
            </div>

            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label">Ime</label>
                    <Placeholder animation="glow">
                        <Placeholder xs={12} />
                    </Placeholder>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">Prezime</label>
                    <Placeholder animation="glow">
                        <Placeholder xs={12} />
                    </Placeholder>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label">MFG Grupa</label>
                    <Placeholder animation="glow">
                        <Placeholder xs={12} />
                    </Placeholder>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">MFG Voditelj</label>
                    <Placeholder animation="glow">
                        <Placeholder xs={12} />
                    </Placeholder>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label">Kontakt mobitel</label>
                    <Placeholder animation="glow">
                        <Placeholder xs={12} />
                    </Placeholder>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">Kontakt e-mail</label>
                    <Placeholder animation="glow">
                        <Placeholder xs={12} />
                    </Placeholder>
                </div>
            </div>

            <h5 className="mt-4">Adresa rada</h5>

            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label">Ulica</label>
                    <Placeholder animation="glow">
                        <Placeholder xs={12} />
                    </Placeholder>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">Kućni broj</label>
                    <Placeholder animation="glow">
                        <Placeholder xs={12} />
                    </Placeholder>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label">Poštanski broj</label>
                    <Placeholder animation="glow">
                        <Placeholder xs={12} />
                    </Placeholder>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">Grad</label>
                    <Placeholder animation="glow">
                        <Placeholder xs={12} />
                    </Placeholder>
                </div>
            </div>

            <div className="d-flex gap-2 mt-3">
                <Placeholder.Button variant="primary" xs={3} />
                <Placeholder.Button variant="secondary" xs={3} />
            </div>
        </div>
    );
}
