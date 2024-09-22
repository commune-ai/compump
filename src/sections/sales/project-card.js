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
// _mock
import { _socials } from 'src/_mock';
// assets
import { AvatarShape } from 'src/assets/illustrations';
import 'src/assets/css/index.css';
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
    tokenName,
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
 
  const handleModuleDetail = useCallback(() => {
    router.push(`/dashboard/${moduleAddress}/detail`);
  }, [moduleAddress, router]);
  return (
    <Card
      sx={{
        width: '340px',
        textAlign: 'center',
        cursor: 'pointer',
        borderRadius:'8px',
        boxShadow: '4px 3px 2px 3px (40,90,100,0.6)',
        transition: 'transform 0.3s ease',
        '&:hover': {
          transform: 'translateY(-10px)',
          boxShadow: 9, // Move the card up when hovered
        },
      }}
      onClick={() => handleModuleDetail()}
    >
      <Box sx={{ position: 'relative' }}>
        <Typography variant='caption' sx={{fontWeight: '900', fontSize: '40px', position:'absolute', top:'1%', left:'4%', zIndex:'99'}}>
          {tokenSymbol}
        </Typography>
        {/* <Box sx={{p:3, borderRadius:'100%', opacity:'20%', bgcolor:'secondary'}}> */}
        <Avatar
          alt={tokenName}
          src="/assets/chains/eth-coin2.png"
          sx={{
            width: 64,
            height: 64,
            zIndex: 11,
            top: '2%',
            right: '2%',
            mx: 'auto',
            backgroundColor: 'rgba(224, 233, 241, 0.6)',
            border:'1px solid secondary',
            position: 'absolute',
          }}
        />
        {/* </Box> */}

        <Image
          src={logoURL}
          ratio="4/3"
          alt={logoURL}
          overlay={alpha(theme.palette.grey[900], 0.1)}
        />
        <Box
            display="grid"
            sx={{ p: 2, typography: 'subtitle1'}}
          >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="caption" component="div"  sx={{ color: 'text.secondary',letterSpacing: '2px', fontWeight: '400',  fontSize: '24px', textAlign: 'center', lineHeight:'0.5px'}}>
            Total Stakers
          </Typography>
          <Typography variant="h6" sx={{ color: '#00FFA3', fontWeight: 'bold' }}>
            {holders.length}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
        <Typography variant="caption" component="div"  sx={{ color: 'text.secondary',letterSpacing: '2px', fontWeight: '400',  fontSize: '24px', textAlign: 'center', lineHeight:'0.5px' }}>
        Total Staked
          </Typography>
          <Typography variant="h6" sx={{ color: '#00FFA3', fontWeight: 'bold' }}>
          {Number(totalRaised)}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
        <Typography variant="caption" component="div"  sx={{color: 'text.secondary',letterSpacing: '2px', fontWeight: '400',  fontSize: '24px', textAlign: 'center', lineHeight:'0.5px' }}>
        Emission
          </Typography>
          <Typography variant="h6" sx={{ color: '#00FFA3', fontWeight: 'bold' }}>
            {emissionByPercent}%
          </Typography>
        </Stack>
      
        </Box> 
       
   


       
      </Box>
      

      {/* <ListItemText
        sx={{ mt: 7, mb: 1 }}
        primary={tokeName}
        secondary={tokenSymbol}
        primaryTypographyProps={{ typography: 'subtitle1' }}
        secondaryTypographyProps={{ component: 'span', mt: 0.5 }}
      /> */}

      {/* <Stack direction="row" alignItems="center" justifyContent="center" sx={{ mb: 2.5 }} className='social_icon'>
     
      </Stack> */}

      {/* <Divider sx={{ borderStyle: 'dashed' }} /> */}

     
    </Card>
  );
}
