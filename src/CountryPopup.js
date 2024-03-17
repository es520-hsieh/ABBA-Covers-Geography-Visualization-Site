import React, { useState } from 'react';
import BubbleChart from './bubblechart';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TablePagination from '@mui/material/TablePagination';
import IconButton from '@mui/material/IconButton';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import Box from '@mui/material/Box';
import TableFooter from '@mui/material/TableFooter';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { Grid } from '@mui/material';

function TablePaginationActions(props) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};

const CountryPopup = ({ countryName, onClose, bubbleData }) => {
  const [clickedBubbleData, setClickedBubbleData] = useState(null);

  const handleBubbleClick = (data) => {
    // Filter bubbleData by popupCountry and clicked bubble's Song Name
    const filteredData = bubbleData.filter(item => item['Artist Country'] === countryName && item['Original'] === data.name);
    if (filteredData) {
      // Sort filteredData by Release year in descending order
      filteredData.sort((a, b) => b['Release year'] - a['Release year']);
      setClickedBubbleData(filteredData);
    } else {
      setClickedBubbleData(null);
    }
  };  

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div className="popup">
      <div className="popup-header">
        <h2>{countryName}</h2>
        <button onClick={onClose} className="close-btn">Close</button>
      </div>
      <div className="popup-content">
        <Box sx={{ width: '100%' }}>
          <Grid container spacing={22}>
            <Grid item xs={6}>
              <BubbleChart popupCountry={countryName} bubbleData={bubbleData} onBubbleClick={handleBubbleClick} />
            </Grid>
            <Grid item xs={6}>
              {clickedBubbleData && (
                <div>
                  <TableContainer component={Paper} className="popup-table">
                    <Table size="small" aria-label="simple table">
                      <TableHead>
                        <TableRow>
                          <TableCell>Song</TableCell>
                          <TableCell>Artist</TableCell>
                          <TableCell>Year</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(rowsPerPage > 0
                          ? clickedBubbleData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          : clickedBubbleData
                        ).map((item, index) => (
                          <TableRow key={index}>
                            <TableCell><a href={item['Song-url']} target="_blank" rel="noopener noreferrer">{item['Song Name']}</a></TableCell>
                            <TableCell><a href={item['Artist-url']} target="_blank" rel="noopener noreferrer">{item['Artist']}</a></TableCell>
                            <TableCell>{item['Release year']}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TablePagination
                            rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                            colSpan={3}
                            count={clickedBubbleData.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            ActionsComponent={TablePaginationActions}
                          />
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </TableContainer>
                </div>
              )}
            </Grid>
          </Grid>
        </Box>
      </div>
    </div>
  );
};

export default CountryPopup;
