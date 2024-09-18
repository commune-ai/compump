import PropTypes from 'prop-types';
import { useCallback } from 'react';
// @mui
import { alpha, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
// utils
import { fShortenString } from 'src/utils/format-address';
// _mock
import { _socials } from 'src/_mock';
// assets
import { AvatarShape } from 'src/assets/illustrations';
// components
import Image from 'src/components/image';
import Iconify from 'src/components/iconify';

import { useRouter } from 'src/routes/hooks';

// ----------------------------------------------------------------------

export default function ProjectCard({ module }) {
  const theme = useTheme();
  const router = useRouter();
  const {
    moduleAddress,
    tokeName,
    token,
    tokenSymbol,
    totalRaised,
    totalSupply,
    moduleDetails,
    holders,
    emission,
  } = module;
  // console.log("tokeName", tokeName)
  const logoURL = moduleDetails.toString().split('$#$')[0];
  const facebook = moduleDetails.toString().split('$#$')[1];
  const linkedin = moduleDetails.toString().split('$#$')[2];
  const instagram = moduleDetails.toString().split('$#$')[3];
  const twitter = moduleDetails.toString().split('$#$')[4];
  const emissionByPercent = Number(emission) / 10 ** 4;
  const socials = [];
  if (facebook) {
    socials.push({
      color: '#1877F2',
      icon: 'eva:facebook-fill',
      name: 'FaceBook',
      path: facebook,
      value: 'facebook',
    });
  }
  if (linkedin) {
    socials.push({
      color: '#007EBB',
      icon: 'eva:linkedin-fill',
      name: 'Linkedin',
      path: linkedin,
      value: 'linkedin',
    });
  }
  if (instagram) {
    socials.push({
      color: '#E02D69',
      icon: 'ant-design:instagram-filled',
      name: 'Instagram',
      path: instagram,
      value: 'instagram',
    });
  }

  if (twitter) {
    socials.push({
      color: '#00AAEC',
      icon: 'eva:twitter-fill',
      name: 'Twitter',
      path: twitter,
      value: 'twitter',
    });
  }
  const handleModuleDetail = useCallback(() => {
    router.push(`/dashboard/${moduleAddress}/detail`);
  }, [moduleAddress, router]);
  return (
    <Card
      sx={{
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'transform 0.3s ease',
        '&:hover': {
          transform: 'translateY(-10px)',
          boxShadow: 9, // Move the card up when hovered
        },
      }}
      onClick={() => handleModuleDetail()}
    >
      <Box sx={{ position: 'relative' }}>
        <AvatarShape
          sx={{
            left: 0,
            right: 0,
            zIndex: 10,
            mx: 'auto',
            bottom: -26,
            position: 'absolute',
          }}
        />

        <Avatar
          alt={tokeName}
          src="/assets/chains/eth-coin2.png"
          sx={{
            width: 64,
            height: 64,
            zIndex: 11,
            left: 0,
            right: 0,
            bottom: -32,
            mx: 'auto',
            position: 'absolute',
          }}
        />

        <Image
          src={logoURL}
          alt={logoURL}
          ratio="16/9"
          overlay={alpha(theme.palette.grey[900], 0.1)}
        />
      </Box>

      <ListItemText
        sx={{ mt: 7, mb: 1 }}
        primary={tokeName}
        secondary={tokenSymbol}
        primaryTypographyProps={{ typography: 'subtitle1' }}
        secondaryTypographyProps={{ component: 'span', mt: 0.5 }}
      />

      <Stack direction="row" alignItems="center" justifyContent="center" sx={{ mb: 2.5 }}>
        {socials.map((social) => (
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

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Box
        display="grid"
        gridTemplateColumns="repeat(3, 1fr)"
        sx={{ py: 3, typography: 'subtitle1' }}
      >
        <div>
          <Typography variant="caption" component="div" sx={{ mb: 0.5, color: 'text.secondary' }}>
            Total Stakers
          </Typography>
          {holders.length}
        </div>

        <div>
          <Typography variant="caption" component="div" sx={{ mb: 0.5, color: 'text.secondary' }}>
            Total Staked
          </Typography>

          {Number(totalRaised)}
        </div>

        <div>
          <Typography variant="caption" component="div" sx={{ mb: 0.5, color: 'text.secondary' }}>
            Emission
          </Typography>
          {emissionByPercent}%
        </div>
      </Box>
    </Card>
  );
}
