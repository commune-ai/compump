'use client';

import { useEffect } from 'react';

// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import Grid from '@mui/material/Unstable_Grid2';

// components
import Loading from 'src/app/loading';
import { useSearchFilter } from 'src/context/SearchFilterContext';
import { useSettingsContext } from 'src/components/settings';
import ProjectCard from './project-card';
import { useCommonStats, useMyStakeStats } from './helper/useStats';
// ----------------------------------------------------------------------

export default function SalesList() {
  const settings = useSettingsContext();
  const { filteredStats, filteredMyStats, filters, setStats, setMyStats } = useSearchFilter();

  const commonStats = useCommonStats();
  const myStakeStats = useMyStakeStats();

  useEffect(() => {
    if (commonStats.length > 0) {
      setStats(commonStats);
    }
    if (myStakeStats.length > 0) {
      setMyStats(myStakeStats);
    }
  }, [commonStats, myStakeStats, setStats, setMyStats]);

  if (commonStats.length === 0 && myStakeStats.length === 0) {
    return <Loading />;
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Grid container spacing={3}>        
        <Box
          sx={{
            marginTop: '40px',
            marginLeft: '15px',
          }}
        ></Box>
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
        {filters?.publish === 'all'
          ? filteredStats.map((stat) => <ProjectCard key={stat.moduleAddress} module={stat} />)
          : filteredMyStats.map((myStat) => (
              <ProjectCard key={myStat.moduleAddress} module={myStat} />
            ))}
      </Box>
    </Container>
  );
}
