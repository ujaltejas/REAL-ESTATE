import { Marker, Popup } from 'react-leaflet'
import './pin.scss'
import { Link } from 'react-router-dom'

function Pin({ item }) {
    return (
        <Marker position={[item.lat, item.lng]}>
            <Popup>
                <div className="popupContainer">
                    <img src={item.images} alt="" />
                    <div className="textContainer">
                        <Link to={`/${item.id}`}>{item.title}</Link>
                        <span>{item.address} </span>
                        <b>${item.price}</b>
                    </div>
                </div>
            </Popup>
        </Marker>
    );
}

export default Pin