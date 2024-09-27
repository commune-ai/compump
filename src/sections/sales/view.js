'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAccount, useCall, useChainId } from 'wagmi';

// @mui
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Unstable_Grid2';
import InputAdornment from '@mui/material/InputAdornment';

// components
import Label from 'src/components/label';
import { useSettingsContext } from 'src/components/settings';
import Iconify from 'src/components/iconify';
import ProjectCard from './project-card';
import CreateForm from '../create/create-dialog';
import { useCommonStats, useMyStakeStats } from './helper/useStats';
import { Button } from '@mui/material';
// ----------------------------------------------------------------------
import { contract } from '../../constant/contract';

const defaultFilters = {
  publish: 'all',
};

export default function SalesList() {
  const settings = useSettingsContext();
  const [updater, setUpdater] = useState(1);
  const stats = useCommonStats(updater);
  const myStats = useMyStakeStats(updater);
  const [searchStats, setSearchStats] = useState(stats);
  const [searchMyStats, setSearchMyStats] = useState(myStats);
  const [searchLoading, setSearchLoading] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);
  useEffect(() => {
    setSearchStats(stats);
    setSearchMyStats(myStats);
  }, [stats, myStats]);
  const handleChange = (e) => {
    setSearchLoading(true);
    const searchResults1 = stats.filter(
      (stat) =>
        stat.moduleAddress.includes(e.target.value) ||
        stat.token.includes(e.target.value) ||
        stat.tokenName.includes(e.target.value) ||
        stat.tokenSymbol.includes(e.target.value) ||
        stat.moduleDetails.includes(e.target.value)
    );
    setSearchStats(searchResults1);
    const searchResults2 = myStats.filter(
      (stat) =>
        stat.moduleAddress.includes(e.target.value) ||
        stat.token.includes(e.target.value) ||
        stat.tokenName.includes(e.target.value) ||
        stat.tokenSymbol.includes(e.target.value) ||
        stat.moduleDetails.includes(e.target.value)
    );
    setSearchMyStats(searchResults2);
    setSearchLoading(false);
  };
  const handleFilters = useCallback((name, value) => {
    setFilters((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);
  const handleFilterPublish = useCallback(
    (event, newValue) => {
      handleFilters('publish', newValue);
    },
    [handleFilters]
  );
  const buyComp = () => {
    window.open(
      `https://app.uniswap.org/swap?outputCurrency=${contract['default'].compToken}&chain=ethereum&use=V3`
    );
  };
  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      {/* <Typography variant="h4"> Page One </Typography> */}

      {/* <Box
        sx={{
          mt: 5,
          width: 1,
          height: 320,
          borderRadius: 2,
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
          border: (theme) => `dashed 1px ${theme.palette.divider}`,
        }}
      /> */}

      <Grid container spacing={3} sx={{ justifyContent: 'space-between' }}>
        <Box
          sx={{
            marginTop: '25px',
            marginLeft: '15px',
          }}
        >
          <CreateForm setUpdater={setUpdater} />
          <Button
            variant="contained"
            color="primary"
            sx={{
              marginLeft: { xs: '0px', sm: '20px' },
              marginTop: { xs: 1, sm: 0 },
              width: { xs: '70%', sm: 'auto' },
            }}
            sm={12}
            onClick={buyComp}
          >
            Buy COMP
          </Button>
        </Box>
        <Box flexGrow={1}></Box>
        <Box
          sx={{
            marginTop: '10px',
            // marginLeft: '15px',
          }}
        >
          <Tabs
            value={filters.publish}
            onChange={handleFilterPublish}
            sx={{
              mb: { xs: 3, md: 5 },
            }}
          >
            {['all', 'my contribution'].map((tab) => (
              <Tab
                key={tab}
                iconPosition="end"
                value={tab}
                label={tab}
                icon={
                  <Label
                    variant={(tab === 'all' && 'filled') || 'soft'}
                    color={(tab === 'all' && 'primary') || 'info'}
                  >
                    {tab === 'all' && stats.length}

                    {tab === 'my contribution' && myStats.length}
                  </Label>
                }
                sx={{ textTransform: 'capitalize' }}
              />
            ))}
          </Tabs>
        </Box>
        <Box
          sx={{
            paddingRight: '20px',
            marginTop: '15px',
            marginLeft: '25px',
            marginBottom: { xs: 2, sm: 2 },
          }}
        >
          <TextField
            // {...params}
            placeholder="Search..."
            // onKeyUp={handleKeyUp}
            InputProps={{
              // ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ ml: 1, color: 'text.disabled' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <>
                  {searchLoading ? (
                    <Iconify icon="svg-spinners:8-dots-rotate" sx={{ mr: -3 }} />
                  ) : null}
                  {/* {params.InputProps.endAdornment} */}
                </>
              ),
            }}
            onChange={handleChange}
          />
        </Box>
      </Grid>
      <Box
        gap={3}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(4, 1fr)',
        }}
      >
        {filters.publish === 'all'
          ? searchStats.map((stat) => (
              <ProjectCard key={stat.moduleAddress} module={stat} setUpdater={setUpdater} />
            ))
          : searchMyStats.map((myStat) => (
              <ProjectCard key={myStat.moduleAddress} module={myStat} setUpdater={setUpdater} />
            ))}
      </Box>
    </Container>
  );
}
