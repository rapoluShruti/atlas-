import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const YogaMapPage = () => {
  // Sample yoga studio locations (you can replace with real data)
  const yogaStudios = [
    {
      id: 1,
      name: "Peaceful Yoga Studio",
      position: [19.0760, 72.8777], // Mumbai coordinates
      description: "Traditional Hatha and Vinyasa classes",
      rating: 4.5
    },
    {
      id: 2,
      name: "Zen Garden Yoga",
      position: [19.0820, 72.8810],
      description: "Meditation and mindfulness sessions",
      rating: 4.8
    },
    {
      id: 3,
      name: "Power Flow Studio",
      position: [19.0700, 72.8700],
      description: "High-energy Vinyasa and Ashtanga",
      rating: 4.3
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🗺️ Find Yoga Studios Near You</h1>
          <p className="text-gray-600 text-lg">Discover yoga communities and practice locations</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 border border-orange-100">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Yoga Studios Map</h2>
            <p className="text-gray-600">Click on markers to see studio details and book classes</p>
          </div>

          <div className="h-96 rounded-xl overflow-hidden border-2 border-orange-200">
            <MapContainer
              center={[19.0760, 72.8777]} // Mumbai center
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              className="rounded-xl"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {yogaStudios.map((studio) => (
                <Marker key={studio.id} position={studio.position}>
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-bold text-lg text-gray-800">{studio.name}</h3>
                      <p className="text-gray-600 mb-2">{studio.description}</p>
                      <div className="flex items-center mb-3">
                        <span className="text-yellow-500 mr-1">⭐</span>
                        <span className="font-semibold">{studio.rating}</span>
                      </div>
                      <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors duration-200 font-medium">
                        Book Class
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {yogaStudios.map((studio) => (
              <div key={studio.id} className="bg-gradient-to-br from-orange-50 to-white p-4 rounded-xl border border-orange-200 hover:border-orange-300 transition-all duration-200 hover:shadow-lg">
                <h3 className="font-bold text-gray-800 mb-2">{studio.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{studio.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-yellow-500 mr-1">⭐</span>
                    <span className="font-semibold text-sm">{studio.rating}</span>
                  </div>
                  <button className="bg-orange-500 text-white px-3 py-1 rounded-lg hover:bg-orange-600 transition-colors duration-200 text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default YogaMapPage;