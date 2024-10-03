'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

// @mui
import { alpha, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
// routes
import { RouterLink } from 'src/routes/components';
// components
import Iconify from 'src/components/iconify';
import EmptyContent from 'src/components/empty-content';
import { useSettingsContext } from 'src/components/settings';
import Image from 'src/components/image';
import { contract } from 'src/constant/contract';
import { fShortenString } from 'src/utils/format-address';

//
import { ModuleSkeleton } from './module-skeleton';
import AdminAction from './admin-action';
import UserAction from './user-action';

import { useModuleStats } from './helper/useStats';

// ----------------------------------------------------------------------

export default function ModuleDetailView({ moduleAddress }) {
  const theme = useTheme();
  const settings = useSettingsContext();

  //   const checkout = useCheckoutContext();
  const [updater, setUpdater] = useState('1');
  const stats = useModuleStats(updater, moduleAddress);
  const { address } = useAccount();
  const [isAdmin, setIsAdmin] = useState(false);


  useEffect(() => {
    if (address && address === stats.moduleInfo.creator) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [address, stats]);

  const renderSkeleton = <ModuleSkeleton />;

  const renderError = (
    <EmptyContent
      filled
      title={`${stats.error?.message}`}
      action={
        <Button
          component={RouterLink}
          href="/dashboard"
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
          sx={{ mt: 3 }}
        >
          Back to List
        </Button>
      }
      sx={{ py: 10 }}
    />
  );

  const renderModule = (
    
      <Grid container spacing={{ xs: 3, md: 5, lg: 8 }}>
        <Grid xs={12} md={6} lg={7}>
          <Box
            sx={{
              '& .slick-slide': {
                float: 'left',
              },
            }}
          >
            <Box
              sx={{
                mb: 3,
                borderRadius: 2,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <Image
                src={stats.moduleInfo.logoURL}
                alt={stats.moduleInfo.logoURL}
                ratio="1/1"
                overlay={alpha(theme.palette.grey[900], 0.1)}
              />
            </Box>
          </Box>
        </Grid>

        <Grid xs={12} md={6} lg={5}>
          <Stack spacing={3} sx={{ pt: 3 }}>
            <Stack spacing={2} alignItems="flex-start">
              <Typography variant="h5">{stats.moduleInfo.tokenName}</Typography>
            </Stack>
            <Divider sx={{ borderStyle: 'dashed' }} />
            <Stack direction="row">
              <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                Creator
              </Typography>

              <Typography
                variant="subtitle2"
                sx={{ cursor: 'pointer' }}
                onClick={() => window.open(contract.default.scanURL + stats.moduleInfo.creator)}
              >
                {fShortenString(stats.moduleInfo.creator)}
              </Typography>
            </Stack>
            <Stack direction="row">
              <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                CA
              </Typography>

              <Typography
                variant="subtitle2"
                sx={{ cursor: 'pointer' }}
                onClick={() => window.open(contract.default.scanURL + stats.moduleInfo.ca)}
              >
                {fShortenString(stats.moduleInfo.ca)}
              </Typography>
            </Stack>
            <Stack direction="row">
              <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                Symbol
              </Typography>

              <Typography variant="subtitle2">{stats.moduleInfo.symbol}</Typography>
            </Stack>
            <Stack direction="row">
              <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                Decimal
              </Typography>

              <Typography variant="subtitle2">18</Typography>
            </Stack>
            <Stack direction="row">
              <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                Total Staked
              </Typography>

              <Typography variant="subtitle2">
                {(Number(stats.moduleInfo?.totalStaked) / 10 ** 18).toFixed(2)}{' '}
                {stats.moduleInfo?.symbol}
              </Typography>
            </Stack>
            <Stack direction="row">
              <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                Total Stakers
              </Typography>

              <Typography variant="subtitle2">{stats.moduleInfo?.stakers?.length}</Typography>
            </Stack>
            <Divider sx={{ borderStyle: 'dashed' }} />
            <Stack direction="row">
              <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                Emission
              </Typography>

              <Typography variant="subtitle2">{stats.moduleInfo.emission}% (per day)</Typography>
            </Stack>
            <Stack direction="row">
              <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                Socials
              </Typography>

              <Stack direction="row" alignItems="center" justifyContent="center" sx={{ mb: 2.5 }}>
                {stats.moduleInfo.socials?.map((social) => (
                  <IconButton
                    key={social.name}
                    sx={{
                      color: social.color,
                      '&:hover': {
                        bgcolor: alpha(social.color, 0.08),
                      },
                    }}
                    onClick={() => window.open(social.path)}
                  >
                    <Iconify icon={social.icon} />
                  </IconButton>
                ))}
              </Stack>
            </Stack>
            <Divider sx={{ borderStyle: 'dashed' }} />
            {isAdmin ? (
              <AdminAction
                stats={stats}
                setUpdater={setUpdater}
                moduleAddress={moduleAddress}
              ></AdminAction>
            ) : (
              <UserAction
                stats={stats}
                setUpdater={setUpdater}
                moduleAddress={moduleAddress}
              ></UserAction>
            )}
          </Stack>
        </Grid>
      </Grid>
  
  );

  return (
    <Container
      maxWidth={settings.themeStretch ? false : 'lg'}
      sx={{
        mt: 5,
        mb: 15,
      }}
    >
      {/* <CartIcon totalItems={checkout.totalItems} /> */}

      {stats.loading && renderSkeleton}

      {stats.error ? renderError : renderModule}
    </Container>
  );
}
