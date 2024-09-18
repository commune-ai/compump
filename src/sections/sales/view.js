'use client';

import { useCallback, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';

// @mui
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import Grid from '@mui/material/Unstable_Grid2';

// components
import Label from 'src/components/label';
import { SeoIllustration } from 'src/assets/illustrations';
import { useSettingsContext } from 'src/components/settings';
import CreateOverview from '../create/create-overview';
import ProjectCard from './project-card';
import CreateForm from '../create/create-dialog';
import { useCommonStats, useMyStakeStats } from './helper/useStats';
// ----------------------------------------------------------------------

const defaultFilters = {
  publish: 'all',
};

export default function SalesList() {
  const settings = useSettingsContext();
  const chainId = useChainId();
  const { address } = useAccount();
  const [updater, setUpdater] = useState(1);
  const stats = useCommonStats(updater);
  const myStats = useMyStakeStats(updater);

  const [filters, setFilters] = useState(defaultFilters);
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
      <Grid container spacing={3}>
        <Grid xs={12} md={12}>
          <CreateOverview
            title={`Welcome to 👋 ComPump \n`}
            description={`\n Please create your meme coin! Make your Coin and Module. Let users have fun to stake/unstake`}
            img={<SeoIllustration />}
            action={<CreateForm />}
          />
        </Grid>
        <Box
          sx={{
            marginTop: '15px',
            marginLeft: '15px',
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
          ? stats.map((stat) => <ProjectCard key={stat.moduleAddress} module={stat} />)
          : myStats.map((myStat) => <ProjectCard key={myStat.moduleAddress} module={myStat} />)}
      </Box>
    </Container>
  );
}
