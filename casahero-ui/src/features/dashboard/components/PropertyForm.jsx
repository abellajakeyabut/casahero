import "./PropertyForm.css";
import { useEffect, useState } from "react";

const MAX_PHOTOS = 10;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB
import { useCities, useRegions } from "../../../hooks/useListings";

const PropertyForm = ({ show, onClose }) => {
    const regions = useRegions();
    const filters = { region: '', cities: '' }
    const [formSelect, setFormSelect] = useState(filters);

    const cityList = useCities(formSelect.region);


    const [formData, setFormData] = useState({
        propertyType: '',
        region: '',
        city: '',
        bed: '',
        bath: '',
        propertyName: ''
    });
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
        e.preventDefuault();
    }
    const selectRegion = (regionValue) => {
        setFormSelect({ ...formSelect, region: regionValue })
        setFormData({ ...formData, region: regionValue, city: '' })

    }

    return (
        show ? <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <button className="modal-close" onClick={onClose}>
                        X
                    </button>
                    <p>Fill in the details of your property</p>
                    <hr />
                    <div className="modal-header">
                        <h2>{formData.propertyName}</h2>

                    </div>
                    <div className="modal-body">
                        <div className="form-row">
                            <label for="name">Property Name : </label>
                            <input required type="text" placeholder="Name" value={formData.propertyName} onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })} />
                        </div>
                        <div className="form-row">
                            <label for="type">Property Type : </label>
                            <select value={formData.propertyType} onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}>
                                <option value="">Select Type</option>
                                <option value="apartment">Apartment</option>
                                <option value="house">House</option>
                                <option value="condo">Condo</option>
                            </select>

                        </div>
                        <div className="form-row">
                            <label for="region">Region: </label>
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
                            <label for="City">City: </label>
                            <select
                                required
                                id="city"
                                value={formData.city}
                                // a new region invalidates the chosen city
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                disabled={regions.isPending}
                            >
                                <option value="">Select City...</option>
                                {cityList?.data?.map(({ city }) => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>

                        </div>
                        <div className="form-row">
                            <label for="beds">Beds : </label>
                            <input type="number" id="beds" placeholder="Beds"></input>
                            <label for="baths">Baths : </label>
                            <input type="number" id="baths" placeholder="Baths"></input>
                        </div>
                        <div className="form-row form-row--top">
                            <label htmlFor="photos">Photos : </label>
                            <div className="photo-upload">
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
                                                    aria-label={`Remove photo ${i + 1}`}
                                                >
                                                    ✕
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
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
