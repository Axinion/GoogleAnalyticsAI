'use client';

interface GeographicDataProps {
  countries: Array<{ country: string; count: number }>;
  cities?: Array<{ city: string; count: number }>;
  regions?: Array<{ region: string; count: number }>;
}

export function GeographicData({ countries, cities, regions }: GeographicDataProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Geographic Data</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Countries */}
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-3">Top Countries</h4>
          <div className="space-y-2">
            {countries.slice(0, 10).map((country, index) => (
              <div key={country.country} className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-600 w-6">{index + 1}.</span>
                  <span className="text-sm text-gray-900">{country.country}</span>
                </div>
                <span className="text-sm font-medium text-gray-600">{country.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cities */}
        {cities && cities.length > 0 && (
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-3">Top Cities</h4>
            <div className="space-y-2">
              {cities.slice(0, 10).map((city, index) => (
                <div key={city.city} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-600 w-6">{index + 1}.</span>
                    <span className="text-sm text-gray-900">{city.city}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-600">{city.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regions */}
        {regions && regions.length > 0 && (
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-3">Top Regions</h4>
            <div className="space-y-2">
              {regions.slice(0, 10).map((region, index) => (
                <div key={region.region} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-600 w-6">{index + 1}.</span>
                    <span className="text-sm text-gray-900">{region.region}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-600">{region.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Placeholder for future map integration */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 text-center">
          Interactive map visualization coming soon
        </p>
      </div>
    </div>
  );
}