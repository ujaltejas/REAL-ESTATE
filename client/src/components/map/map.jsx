import { MapContainer, TileLayer } from 'react-leaflet'
import './map.scss'
import "leaflet/dist/leaflet.css";

function Map({ item }) {
    return (

        <MapContainer center={[25.7617, -80.1918]} zoom={7} scrollWheelZoom={false} className='map' >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {item.map(item => (
                <pin item={item} key={item.id} />
            ))}
        </MapContainer>
    )
}


export default Map