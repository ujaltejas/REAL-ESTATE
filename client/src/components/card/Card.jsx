import { Link } from 'react-router-dom'
import './card.scss'

function Card({ item }) {
    // Handle potential missing or inconsistent data
    const imageUrl = item.images || item.imges || item.img || '/placeholder-property.jpg';
    const bathrooms = item.bathrooms || item.bathroom || 0;
    const formattedPrice = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(item.price);

    return (
        <div className="card">
            <Link to={`/${item.id}`} className="imageContainer">
                <img src={imageUrl} alt={item.title} />
                {item.status && (
                    <div className={`status ${item.status}`}>
                        {item.status.replace('-', ' ')}
                    </div>
                )}
            </Link>
            <div className="textContainer">
                <h2 className="title">
                    <Link to={`/${item.id}`}>{item.title}</Link>
                </h2>
                <p className="address">
                    <img src="/pin.png" alt="" />
                    <span>{item.address}</span>
                </p>
                <p className="price">{formattedPrice}</p>
                <div className="bottom">
                    <div className="features">
                        <div className="featureItem">
                            <img src="/bed.png" alt="" />
                            <span>{item.bedrooms || 0} {item.bedrooms === 1 ? 'bed' : 'beds'}</span>
                        </div>
                        <div className="featureItem">
                            <img src="/bath.png" alt="" />
                            <span>{bathrooms} {bathrooms === 1 ? 'bath' : 'baths'}</span>
                        </div>
                        {item.area && (
                            <div className="featureItem">
                                <img src="/size.png" alt="" />
                                <span>{item.area}</span>
                            </div>
                        )}
                    </div>
                    {/* <div className="icons">
                        <div className="iconItem">
                            <img src="/save.png" alt="" />
                        </div>
                        {item.views !== undefined && (
                            <div className="iconItem">
                                <img src="/favicon.png" alt="" />
                                <span>{item.views}</span>
                            </div>
                        )}
                    </div> */}
                </div>
            </div>
        </div>
    )
}

export default Card