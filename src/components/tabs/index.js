'use client';

import React from 'react';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Box from '@mui/material/Box';
import Label from 'src/components/label';

export default function TabsComponent({ filters, handleFilterPublish, filteredStatsLength, filteredMyStatsLength }) {
  return (
    <Box
      sx={{
        marginTop: '30px',
        marginLeft: '15px',
        alignItems:'center',
        justifyContent:'center',
        minWidth:'280px'
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
            label={tab === 'all' ? 'Tokens' : 'My Tokens'}
            icon={
              <Label
                sx={{fontSize: '16px'}}
                variant={(tab === 'all' && 'filled') || 'soft'}
                color={(tab === 'all' && 'primary') || 'info'}
              >
                {tab === 'all' ? filteredStatsLength : filteredMyStatsLength}
              </Label>
            }
            sx={{ textTransform: 'capitalize', fontSize: '20px' }}
          />
        ))}
      </Tabs>
    </Box>
  );
}
