import "./PropertyForm.css";
import { useEffect, useState } from "react";
import Spinner from "../../../shared/Spinner";
const MAX_PHOTOS = 10;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB
import { useCities, useRegions, useTypes } from "../../../hooks/useListings";

const STATUSES = [
    { value: "vacant", label: "Available" },
    { value: "occupied", label: "Occupied" },
    { value: "unavailable", label: "Unavailable" },
];

// one property = one rentable unit, so the form captures every column of a properties row
const PropertyForm = ({ show, onClose, updateLandlordProperties }) => {
    const regions = useRegions();
    const types = useTypes();
    const filters = { region: '', cities: '' }
    const [formSelect, setFormSelect] = useState(filters);

    const cityList = useCities(formSelect.region);


    // keys match the properties columns; asking_rent is in S$ here and converted to cents on submit
    const [formData, setFormData] = useState({
        name: '',
        unit_number: '',
        address: '',
        postal_code: '',
        property_type: '',
        region: '',
        city: '',
        bedrooms: '',
        bathrooms: '',
        area_sqft: '',
        asking_rent: '',
        status: 'vacant',
    });
    const setField = (key) => (e) => setFormData({ ...formData, [key]: e.target.value });
    // each photo: { id, file, url } — url is a local preview from createObjectURL
    const [photos, setPhotos] = useState([]);
    const [photoError, setPhotoError] = useState('');

    // free the preview URLs when the form unmounts
    useEffect(() => () => photos.forEach((p) => URL.revokeObjectURL(p.url)), []); // eslint-disable-line react-hooks/exhaustive-deps

    const addPhotos = (e) => {
        const picked = Array.from(e.target.files);
        e.target.value = ''; // let the same file be picked again after removing it
        setPhotoError('');

        const valid = picked.filter((file) => file.type.startsWith('image/') && file.size <= MAX_PHOTO_BYTES);
        if (valid.length < picked.length) setPhotoError('Only images up to 5 MB are allowed.');

        const room = MAX_PHOTOS - photos.length;
        if (valid.length > room) setPhotoError(`You can add up to ${MAX_PHOTOS} photos.`);

        const added = valid.slice(0, Math.max(room, 0)).map((file) => ({
            id: crypto.randomUUID(),
            file,
            url: URL.createObjectURL(file),
        }));
        setPhotos((prev) => [...prev, ...added]);
    };

    const removePhoto = (id) => {
        setPhotos((prev) => {
            const target = prev.find((p) => p.id === id);
            if (target) URL.revokeObjectURL(target.url);
            return prev.filter((p) => p.id !== id);
        });
        setPhotoError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { asking_rent, ...fields } = formData;
        // there's no create endpoint yet; the parent decides what to do with the row
        updateLandlordProperties({
            ...fields,
            unit_number: fields.unit_number.trim() || null,
            bedrooms: Number(fields.bedrooms),
            bathrooms: Number(fields.bathrooms),
            area_sqft: Number(fields.area_sqft),
            asking_rent_cents: Math.round(Number(asking_rent) * 100),
            photos: photos.map((p) => p.file),
        })
        onClose()
       
    }
    const selectRegion = (regionValue) => {
        setFormSelect({ ...formSelect, region: regionValue })
        setFormData({ ...formData, region: regionValue, city: '' })

    }

    return (
        show ? <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <Spinner show={cityList.isFetching || regions.isFetching} />

                <form onSubmit={handleSubmit}>
                    <button type="button" className="modal-close" onClick={onClose}>
                        X
                    </button>
                    <p>Fill in the details of your property</p>
                    <hr />

                    <div className="modal-header">
                        <h2>{[formData.name, formData.unit_number].filter(Boolean).join(' ')}</h2>

                    </div>
                    <div className="modal-body">
                        <div className="modal-splitter">
                            <div>
                                <div className="form-row">
                                    <label htmlFor="name">Property Name : </label>
                                    <input required id="name" type="text" placeholder="e.g. Parc @ Bishan" value={formData.name} onChange={setField('name')} />
                                </div>
                                <div className="form-row">
                                    <label htmlFor="unit_number">Unit No. : </label>
                                    <input id="unit_number" type="text" placeholder="e.g. #08-112 (optional)" value={formData.unit_number} onChange={setField('unit_number')} />
                                </div>
                                <div className="form-row">
                                    <label htmlFor="address">Address : </label>
                                    <input required id="address" type="text" placeholder="e.g. Blk 821 Tampines Street 81" value={formData.address} onChange={setField('address')} />
                                </div>
                                <div className="form-row">
                                    <label htmlFor="postal_code">Postal Code : </label>
                                    <input required id="postal_code" type="text" inputMode="numeric" pattern="[0-9]{6}" title="6 digits" placeholder="520821" value={formData.postal_code} onChange={setField('postal_code')} />
                                </div>
                                <div className="form-row">
                                    <label htmlFor="type">Property Type : </label>
                                    <select required id="type" value={formData.property_type} onChange={setField('property_type')} disabled={types.isPending}>
                                        <option value="">Select Type</option>
                                        {types.data?.map(({ type }) => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>

                                </div>
                                <div className="form-row">
                                    <label htmlFor="region">Region: </label>
                                    <select
                                        required
                                        id="region"
                                        value={formData.region}
                                        // a new region invalidates the chosen city
                                        onChange={(e) => selectRegion(e.target.value)}
                                        disabled={regions.isPending}
                                    >
                                        <option value="">Select Region...</option>
                                        {regions.data?.map(({ region }) => (
                                            <option key={region} value={region}>{region}</option>
                                        ))}
                                    </select>

                                </div>
                                <div className="form-row">
                                    <label htmlFor="city">City: </label>
                                    <select
                                        required
                                        id="city"
                                        value={formData.city}
                                        // a new region invalidates the chosen city
                                        onChange={setField('city')}
                                        disabled={!formData.region || cityList.isPending}
                                    >
                                        <option value="">Select City...</option>
                                        {cityList?.data?.map(({ city }) => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>

                                </div>
                                <div className="form-row">
                                    <label htmlFor="beds">Beds : </label>
                                    <input required type="number" id="beds" min="0" step="1" placeholder="Beds" value={formData.bedrooms} onChange={setField('bedrooms')} />
                                    <label htmlFor="baths">Baths : </label>
                                    <input required type="number" id="baths" min="0" step="1" placeholder="Baths" value={formData.bathrooms} onChange={setField('bathrooms')} />
                                </div>
                                <div className="form-row">
                                    <label htmlFor="area">Size (sqft) : </label>
                                    <input required type="number" id="area" min="1" step="1" placeholder="e.g. 1001" value={formData.area_sqft} onChange={setField('area_sqft')} />
                                </div>

                            </div>
                            <div>
                                <div className="form-row form-row--top">
                                    <label htmlFor="photos">Photos : </label>
                                    <div className="photo-upload">
                                        <div className="form-row">
                                            <label htmlFor="rent">Asking Rent (S$/mo) : </label>
                                            <input required type="number" id="rent" min="0" step="50" placeholder="e.g. 3200" value={formData.asking_rent} onChange={setField('asking_rent')} />
                                        </div>
                                        <div className="form-row">
                                            <label htmlFor="status">Status : </label>
                                            <select id="status" value={formData.status} onChange={setField('status')}>
                                                {STATUSES.map(({ value, label }) => (
                                                    <option key={value} value={value}>{label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <label htmlFor="photos" className="photo-upload__drop">
                                            <span>+ Add photos</span>
                                            <small>{photos.length}/{MAX_PHOTOS} · JPG, PNG, WebP up to 5 MB</small>
                                        </label>
                                        <input
                                            id="photos"
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={addPhotos}
                                            disabled={photos.length >= MAX_PHOTOS}
                                            className="photo-upload__input"
                                        />
                                        {photoError && <p className="photo-upload__error" role="alert">{photoError}</p>}
                                        {photos.length > 0 && (
                                            <ul className="photo-upload__grid">
                                                {photos.map((p, i) => (
                                                    <li key={p.id} className="photo-upload__item">
                                                        <img src={p.url} alt={`Property photo ${i + 1}`} />
                                                        {i === 0 && <span className="photo-upload__cover">Cover</span>}
                                                        <button
                                                            type="button"
                                                            className="photo-upload__remove"
                                                            onClick={() => removePhoto(p.id)}
                                                            aria-label={`Remove photo ${i + 1}`}>
                                                            X
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>
                      <button type="submit">Submit</button>
                    </div>
                </form>

            </div>
        </div>
            : <></>
    );
}
export default PropertyForm;
