'use client';

interface GeographicDataProps {
  countries: Array<{ country: string; count: number }>;
  cities?: Array<{ city: string; count: number }>;
  regions?: Array<{ region: string; count: number }>;
}

export function GeographicData({ countries, cities, regions }: GeographicDataProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Geographic Data</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Global Reach</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Countries */}
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-gray-700 flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            Top Countries
          </h4>
          <div className="space-y-3">
            {countries.slice(0, 10).map((country, index) => (
              <div key={country.country} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-transparent rounded-lg hover:from-blue-100 transition-colors duration-200">
                <div className="flex items-center">
                  <span className="text-sm font-bold text-blue-600 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{country.country}</span>
                </div>
                <span className="text-sm font-bold text-gray-700 bg-white px-2 py-1 rounded-md shadow-sm">
                  {country.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Cities */}
        {cities && cities.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-gray-700 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Top Cities
            </h4>
            <div className="space-y-3">
              {cities.slice(0, 10).map((city, index) => (
                <div key={city.city} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-transparent rounded-lg hover:from-green-100 transition-colors duration-200">
                  <div className="flex items-center">
                    <span className="text-sm font-bold text-green-600 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{city.city}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-700 bg-white px-2 py-1 rounded-md shadow-sm">
                    {city.count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regions */}
        {regions && regions.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-gray-700 flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Top Regions
            </h4>
            <div className="space-y-3">
              {regions.slice(0, 10).map((region, index) => (
                <div key={region.region} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-transparent rounded-lg hover:from-purple-100 transition-colors duration-200">
                  <div className="flex items-center">
                    <span className="text-sm font-bold text-purple-600 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{region.region}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-700 bg-white px-2 py-1 rounded-md shadow-sm">
                    {region.count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Placeholder for future map integration */}
      <div className="mt-6 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border-2 border-dashed border-gray-200">
        <div className="text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p className="text-gray-600 font-medium">Interactive World Map</p>
          <p className="text-sm text-gray-500 mt-1">Coming soon with real-time geographic visualization</p>
        </div>
      </div>
    </div>
  );
}