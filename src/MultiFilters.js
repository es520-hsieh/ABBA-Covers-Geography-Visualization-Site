import React, { useEffect, useState } from "react";
import { items } from "./items";
import "./style.css";
import Map from './map.js';
import Slider, { SliderThumb } from '@mui/material/Slider';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import BarChart from './barchart.js';
import Streamgraph from './areachart.js';
import TreeMapChart from './treemapchart.js';
import PopupView from './PopupView';

function valuetext(value) {
  return `${value} Year`;
}

export default function MultiFilters() {
  const [value, setValue] = useState([1973, 2023]);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const [selectedAlbumFilters, setSelectedAlbumFilters] = useState([]);
  const [selectedSongFilters, setSelectedSongFilters] = useState([]);
  const [filteredItems, setFilteredItems] = useState(items);
  const [showSongFilters, setShowSongFilters] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // Define togglePopup function
  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const albumImages = {
    "Ring Ring": require('./Ring Ring.png'),
    "Waterloo": require('./Waterloo.png'),
    "ABBA": require('./ABBA.png'),
    "Arrival": require('./Arrival.png'),
    "The Album": require('./The Album.png'),
    "Voulez-Vous": require('./Voulez-Vous.png'), 
    "Super Trouper": require('./Super Trouper.png'),
    "The Visitors": require('./The Visitors.png')   
  };

  const filters = Object.keys(albumImages);
  const songFiltersMap = {
    "The Visitors": ['Under Attack', 'When All Is Said and Done', 'Head Over Heels', 'I Let the Music Speak', 'Cassandra', 'Slipping Through My Fingers', 'The Day Before You Came', 'Soldiers', 'One of Us', 'The Visitors', 'Like an Angel Passing Through My Room'],
    "Voulez-Vous": ['Chiquitita', 'I Have a Dream', 'Voulez-vous', 'Gimme! Gimme! Gimme!', 'The King Has Lost His Crown', 'Angeleyes', 'Lovelight', 'Summer Night City', 'Does Your Mother Know', 'As Good as New', "If It Wasn't for the Nights", 'Lovers'],
    "Ring Ring": ['Another Town, Another Train', 'He Is Your Brother', 'People Need Love', 'Nina, Pretty Ballerina', 'Ring Ring', 'Disillusion', "Me and Bobby and Bobby's Brother"],
    "Super Trouper": ['On and on and On', 'Lay All Your Love on Me', 'Super Trouper', 'Our Last Summer', 'The Winner Takes It All', 'The Piper', 'The Way Old Friends Do', 'Happy New Year'],
    "Waterloo": ['Waterloo', 'Sitting in the Palmtree', 'Suzy-Hang-Around', 'Honey, Honey', 'What About Livingstone', 'My Mama Said', 'King Kong Song', 'Dance', 'Hasta ma?ana'],
    "Arrival": ['Tiger', 'When I Kissed the Teacher', 'Dum Dum Diddle', 'Knowing Me, Knowing You', 'Dancing Queen', "That's Me", 'My Love, My Life', 'Arrival', 'Why Did It Have to Be Me', 'Money, Money, Money'],
    "The Album": ['Eagle', 'Move On', 'The Name of the Game', 'Thank You for the Music', 'Hole in Your Soul', 'I Wonder', 'One Man, One Woman', "I'm a Marionette", 'Take a Chance on Me'],
    "ABBA": ['Rock Me', "I've Been Waiting for You", 'So Long', 'Hey, Hey Helen', 'SOS', 'Tropical Loveland', 'Man in the Middle', 'Intermezzo Nr. 1', 'I Do, I Do, I Do, I Do, I Do', 'Mamma mia']
  };

  useEffect(() => {
    filterItems();
  }, [selectedAlbumFilters, selectedSongFilters, value]);

  const filterItems = () => {
    let tempItems = items;

    if (selectedAlbumFilters.length > 0) {
      tempItems = tempItems.filter(item =>
        selectedAlbumFilters.includes(item.Album)
      );
      setShowSongFilters(true);
    } else {
      setShowSongFilters(false);
    }

    if (selectedSongFilters.length > 0) {
      tempItems = tempItems.filter(item =>
        selectedSongFilters.includes(item.Original)
      );
    }

    tempItems = tempItems.filter(item =>
      item.ReleaseYear >= value[0] && item.ReleaseYear <= value[1]
    );

    setFilteredItems(tempItems);
  };

  const handleAlbumFilterButtonClick = (selectedAlbum) => {
    if (selectedAlbumFilters.includes(selectedAlbum)) {
      setSelectedAlbumFilters(selectedAlbumFilters.filter((el) => el !== selectedAlbum));
      setSelectedSongFilters(selectedSongFilters.filter(song => !songFiltersMap[selectedAlbum].includes(song)));
    } else {
      setSelectedAlbumFilters([...selectedAlbumFilters, selectedAlbum]);
    }
  };

  const handleSongFilterButtonClick = (selectedCategory) => {
    // Toggle selected song filters
    if (selectedSongFilters.includes(selectedCategory)) {
      setSelectedSongFilters(selectedSongFilters.filter((el) => el !== selectedCategory));
    } else {
      setSelectedSongFilters([...selectedSongFilters, selectedCategory]);
    }
  };

  const handleDeselectAll = () => {
    setSelectedAlbumFilters([]);
    setSelectedSongFilters([]);
  };

  const [currentChart, setCurrentChart] = useState('Streamgraph');

const renderChart = () => {
  switch(currentChart) {
    case 'BarChart':
      return <BarChart minValue={value[0]} maxValue={value[1]} />;
    case 'Streamgraph':
      return <Streamgraph minValue={value[0]} maxValue={value[1]} />;
    case 'TreeMapChart':
      // Wrap TreeMapChart in a div with the adjusted styling for bottom alignment
      return (
        <div className="treemap-chart-container">
          <TreeMapChart minValue={value[0]} maxValue={value[1]} />
        </div>
      );
    default:
      return null; // Or set a default chart
  }
};
  

  const iOSBoxShadow =
  '0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.13),0 0 0 1px rgba(0,0,0,0.02)';

  const StyledSlider = styled(Slider)(({ theme }) => ({
    color: theme.palette.mode === 'dark' ? '#d63384' : '#d63384',
    height: 2,
    padding: '15px 0',
    '& .MuiSlider-thumb': {
      height: 15,
      width: 15,
      backgroundColor: '#fff',
      boxShadow: '0 0 2px 0px rgba(0, 0, 0, 0.1)',
      '&:focus, &:hover, &.Mui-active': {
        boxShadow: '0px 0px 3px 1px rgba(0, 0, 0, 0.1)',
        // Reset on touch devices, it doesn't add specificity
        '@media (hover: none)': {
          boxShadow: iOSBoxShadow,
        },
      },
      '&:before': {
        boxShadow:
          '0px 0px 1px 0px rgba(0,0,0,0.2), 0px 0px 0px 0px rgba(0,0,0,0.14), 0px 0px 1px 0px rgba(0,0,0,0.12)',
      },
    },
    '& .MuiSlider-valueLabel': {
      fontSize: 15,
      fontWeight: 'bold',
      top: 22,
      backgroundColor: '#181818',
      color: '#d63384', /* Change font color to #d63384 */
      '&::before': {
        display: 'on',
      },
      '& *': {
        background: 'transparent',
        color: '#d63384', /* Change text color to #d63384 */
      },
    },    
    '& .MuiSlider-track': {
      border: 'none',
      height: 5,
    },
    '& .MuiSlider-rail': {
      opacity: 0.5,
      boxShadow: 'inset 0px 0px 4px -2px #000',
      backgroundColor: '#d0d0d0',
    },
  }));

  const marks = [
    {
      value: 1970,
      label: '1970',
    },
    {
      value: 1975,
      label: '1975',
    },
    {
      value: 1980,
      label: '1980',
    },
    {
      value: 1985,
      label: '1985',
    },
    {
      value: 1990,
      label: '1990',
    },
    {
      value: 1995,
      label: '1995',
    },
    {
      value: 2000,
      label: '2000',
    },
    {
      value: 2005,
      label: '2005',
    },
    {
      value: 2010,
      label: '2010',
    },
    {
      value: 2015,
      label: '2015',
    },
    {
      value: 2020,
      label: '2020',
    },
    {
      value: 2025,
      label: '2025',
    },
  ];

  return (
    <div>
      <div className="grid-container">
        <div className="grid-item home">
        <span class="abba">A</span><span class="flipped-b">B</span><span class="abba">BA</span><span class="verse">VERSE</span>
        </div>
        <div className="grid-item filter">
          <div className="buttons-container">
              <button className="button-select" onClick={handleDeselectAll}>
                  RESET SELECTION
              </button>
              <div>
                {filters.map((album, idx) => (
                  <div className={`album-filter ${selectedAlbumFilters.includes(album) ? "active" : ""}`} key={`filters-${idx}`}>
                    <img
                      src={albumImages[album]}
                      alt={album}
                      className={`image-button`}
                      onClick={() => handleAlbumFilterButtonClick(album)}
                    />
                    {selectedAlbumFilters.includes(album) && (
                      <div className="song-filters-container">
                        {songFiltersMap[album].map((song, idx) => (
                          <button
                            key={`songFilters-${idx}`}
                            onClick={() => handleSongFilterButtonClick(song)}
                            className={`button song-filter-button ${
                              selectedSongFilters.includes(song) ? "active" : ""
                            }`}
                            title={song}
                          >
                            {song.split(' ').slice(0, 3).join(' ')}{song.split(' ').length > 3 ? '...' : ''}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
            </div>
          </div>
        </div>
        <div className="grid-item about" onClick={togglePopup}>
          <span class="circle-question">&#x24D8;</span>INFORMATION
        </div>
        <div className="grid-item map">
          <Map
            selectedAlbumFilters={selectedAlbumFilters}
            selectedSongFilters={selectedSongFilters}
            minValue={value[0]}
            maxValue={value[1]}
          />
        </div>
        <div className="grid-item chart">
          {renderChart()}
          <div className="chart-switcher">
  <button className={currentChart === 'BarChart' ? 'active' : ''} onClick={() => setCurrentChart('BarChart')}>Countries and Regions</button>
  <button className={currentChart === 'Streamgraph' ? 'active' : ''} onClick={() => setCurrentChart('Streamgraph')}>Release Year</button>
  <button className={currentChart === 'TreeMapChart' ? 'active' : ''} onClick={() => setCurrentChart('TreeMapChart')}>Album</button>
</div>
        </div>
        <div className="grid-item timeline">
          <Box sx={{ width: 1300}}>
            <StyledSlider
              getAriaLabel={() => 'Release Year range'}
              min={1970}
              max={2025}
              value={value}
              onChange={handleChange}
              valueLabelDisplay="on"
              getAriaValueText={valuetext}
              marks={marks}
              sx={{
      '& .MuiSlider-mark': {
        color: 'gray', // è®¾ç½®???è®°ä¸ºæµ???°è??
      },
      '& .MuiSlider-markLabel': {
        color: 'gray', // å¦??????¨ä????³æ?¹å?????è®°æ??ç­¾ç??é¢????
      },
    }}
            />
          </Box>
        </div>
      </div>
      {/* Render the pop-up component conditionally */}
      {showPopup && <PopupView onClose={togglePopup} />}
      {/* other code... */}
    </div>
  );  
  
}
