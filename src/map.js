import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import * as d3 from 'd3';
import './map.css';
import CountryPopup from './CountryPopup';

mapboxgl.accessToken = 'pk.eyJ1Ijoiemhpa3Vud3UiLCJhIjoiY2x0NHBqcTByMDRrczJpcGh3dXNvZzY4dSJ9.Yxs2WtNq3e7TVVIda1Fwsg';

const Map = ({ selectedAlbumFilters, selectedSongFilters, minValue, maxValue }) => {
    const [minArtistCount, setMinArtistCount] = useState(null);
    const [maxArtistCount, setMaxArtistCount] = useState(null);
    const [bubbleData, setBubbleData] = useState(null); // Define bubbleData as a state variable
    const [clickedCountry, setClickedCountry] = useState(null);
    const mapContainerRef = useRef(null);
    const [mapState, setMapState] = useState({
        zoom: 1.4,
        center: [0, 0],
        projection: 'equirectangular'
    });
    let currentCountry = null;
    let map = null;
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/dark-v11',
            center: mapState.center,
            zoom: mapState.zoom,
            projection: mapState.projection,
        });

        map.setMinZoom(1.4);

        const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            className: 'custom-popup'
        });

        map.on('style.load', () => {
            setIsLoading(false);
            map.setFog({});
            const layers = map.getStyle().layers;

            map.setPaintProperty('water', 'fill-color', '#181818');

            layers.forEach(function(layer) {
                if (layer.id.includes('label') || layer.id.includes('text')) {
                    map.setLayoutProperty(layer.id, 'visibility', 'none');
                }
            });

            Promise.all([
                d3.json(process.env.PUBLIC_URL + "/database.json"),
                d3.json(process.env.PUBLIC_URL + "/geo.json")
            ]).then(([loadedData, geoData]) => {
                if (!loadedData || !geoData) {
                    console.error("Failed to load data");
                    return;
                }

                let filteredData = loadedData;

                filteredData = filteredData.filter(item =>
                    item['Release year'] >= minValue && item['Release year'] <= maxValue
                );

                // Filter data based on selected Album Filters
                if (selectedAlbumFilters.length > 0) {
                    filteredData = filteredData.filter(item => selectedAlbumFilters.includes(item.Album));
                }

                // Filter data based on selected Song Filters
                if (selectedSongFilters.length > 0) {
                    filteredData = filteredData.filter(item => selectedSongFilters.includes(item.Original));
                }

                setBubbleData(filteredData); // Update bubbleData using setBubbleData

                const artistCounts = d3.rollup(filteredData, v => v.length, d => d['Artist Country']);
                const artistCountsArray = Array.from(artistCounts, ([key, value]) => ({ country: key, count: value }));
                const maxArtistCount = Math.max(...artistCountsArray.map(ac => ac.count));

                const minCount = d3.min(artistCountsArray, d => d.count);
                const maxCount = d3.max(artistCountsArray, d => d.count);

                setMinArtistCount(minCount);
                setMaxArtistCount(maxCount);

                geoData.features.forEach(feature => {
                    const artist = artistCountsArray.find(ac => ac.country === feature.properties.name);
                    feature.properties.artistCount = artist ? artist.count : 0;
                });

                map.addSource('states', {
                    'type': 'geojson',
                    'data': geoData
                });

                map.addLayer({
                    'id': 'states-layer',
                    'type': 'fill',
                    'source': 'states',
                    'paint': {
                        'fill-color': ['match', ['get', 'name']].concat(
                            ...artistCountsArray.reduce((acc, {country, count}) => {
                                const color = d3.interpolateBlues(count / maxArtistCount);
                                acc.push(country, color);
                                return acc;
                            }, []), '#333'
                        ),
                        'fill-opacity': 0.8
                    }
                });

                map.addLayer({
                    'id': 'highlight-border',
                    'type': 'line',
                    'source': 'states',
                    'layout': {},
                    'paint': {
                        'line-color': '#ff9d00',
                        'line-width': 2,
                    },
                    'filter': ['==', 'name', '']
                });

                map.on('mousemove', 'states-layer', (e) => {
                    if (e.features.length > 0) {
                        const feature = e.features[0];
                        const artistCount = feature.properties.artistCount;
                        const countryName = feature.properties.name;

                        if (countryName !== currentCountry) {
                            currentCountry = countryName;

                            if (artistCount > 0) {
                                map.getCanvas().style.cursor = 'pointer';
                                popup.setLngLat(e.lngLat)
                                    .setHTML(`${countryName}: ${artistCount} Covers`)
                                    .addTo(map);
                                map.setFilter('highlight-border', ['==', ['get', 'name'], countryName]);
                            } else {
                                popup.remove();
                                map.getCanvas().style.cursor = '';
                            }
                        }
                    }
                });

                map.on('mouseleave', 'states-layer', () => {
                    popup.remove();
                    map.setFilter('highlight-border', ['==', 'name', '']);
                    currentCountry = null;
                    map.getCanvas().style.cursor = '';
                });

                map.on('moveend', () => {
                    setMapState({
                        zoom: map.getZoom(),
                        center: map.getCenter(),
                        projection: mapState.projection
                    });
                });
        
            });
        });

        map.on('click', 'states-layer', (e) => {
            if (e.features.length > 0) {
                const feature = e.features[0];
                const countryName = feature.properties.name;

                // Set the clicked country
                setClickedCountry(countryName);

            }
        });

        return () => {
            map.remove();
        };
    }, [mapState.projection, selectedAlbumFilters, selectedSongFilters, minValue, maxValue]);

    const toggleProjection = () => {
        const newProjection = mapState.projection === 'equirectangular' ? 'globe' : 'equirectangular';
        setMapState({
            zoom: mapState.zoom,
            center: mapState.center,
            projection: newProjection
        });
    };
    
    return (
        <div className="mapContainer" style={{ position: 'relative', width: '100%', height: '100%' }}>
            {clickedCountry && (
                <CountryPopup 
                    countryName={clickedCountry}
                    onClose={() => setClickedCountry(null)}
                    bubbleData={bubbleData} // Pass bubbleData as prop to CountryPopup
                />
            )}
            {isLoading && (
                <div className="spinner-overlay">
                    <div className="spinner"></div>
                </div>
            )}
            <div className="map-overlay">
            <div className="stats-box" style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', zIndex: 999, color: '#ff8c00', padding: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    <div className="cover-min-box" style={{ marginRight: '10px', backgroundColor: '#181818', padding: '5px', borderRadius: '10px', border: '2px solid #ff8c00', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontSize: 'smaller' }}>MIN</span>
        {minArtistCount}
    </div>
    <img src="./colorLabeling.jpeg" alt="" style={{ borderRadius: '10px', border: '2px solid #ff8c00', width: '300px', height: '20px', objectFit: 'fill' }} />
    <div className="cover-max-box" style={{ marginLeft: '10px', backgroundColor: '#181818', padding: '5px', borderRadius: '10px', border: '2px solid #ff8c00', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontSize: 'smaller' }}>MAX</span>
        {maxArtistCount}
    </div>
</div>
            </div>
            </div>
            <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
            <button
    onClick={toggleProjection}
    style={{
        position: 'absolute',
        left: '50%',
        bottom: '10px',
        zIndex: 1,
        transform: 'translateX(-50%)',
    }}
    className="toggle-projection-btn"
>
    SWITCH MODE
</button>
        </div>
    );
};

export default Map;
