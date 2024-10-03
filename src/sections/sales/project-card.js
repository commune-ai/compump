import { useEffect, useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
// @mui
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
// components
import Image from 'src/components/image';
import Iconify from 'src/components/iconify';
// helper functions
import { useRouter } from 'src/routes/hooks';
import UserAction from '../module/user-action';
import AdminAction from '../module/admin-action';

// ----------------------------------------------------------------------

export default function ProjectCard({ module, setUpdater }) {
  const { address } = useAccount();
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  const {
    moduleAddress,
    tokenName,
    tokenSymbol,
    moduleDetails,
    holders,
    emission,
    creator,
  } = module;

  useEffect(() => {
    if (address === creator) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [address, creator]);

  const logoURL = moduleDetails.toString().split('$#$')[0];
  const facebook = moduleDetails.toString().split('$#$')[1];
  const linkedin = moduleDetails.toString().split('$#$')[2];
  const instagram = moduleDetails.toString().split('$#$')[3];
  const twitter = moduleDetails.toString().split('$#$')[4];
  const site = moduleDetails.toString().split('$#$')[5] || '';
  const github = moduleDetails.toString().split('$#$')[6] || '';

  const emissionByPercent = Number(emission) / 10 ** 4;

  const handleModuleDetail = useCallback(() => {
    console.log(moduleAddress)
  }, [moduleAddress, router]);

  const socials = [
    { color: '#4F9FF5', icon: 'eva:facebook-fill', name: 'Facebook', path: facebook },
    { color: '#FF69B4', icon: 'eva:linkedin-fill', name: 'LinkedIn', path: linkedin },
    { color: '#8A2BE2', icon: 'ant-design:instagram-filled', name: 'Instagram', path: instagram },
    { color: '#1DA1F2', icon: 'eva:twitter-fill', name: 'Twitter', path: twitter },
  ].filter(social => social.path);

  const renderSocials = (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="flex-end"
      spacing={1.5}
      sx={{
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 9,
        '& > *': {
          fontSize: '24px',
          opacity: 0.8, 
          transition: 'opacity 0.4s ease, transform 0.4s ease',
          '&:hover': {
            opacity: 1, 
            transform: 'scale(1.2)',
            boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
          },
        },
      }}
    >
      {socials.map(social => (
        <IconButton
          key={social.name}
          sx={{
            color: social.color,
            borderRadius: '50%',
            bgcolor: alpha(social.color, 0.1),
            '&:hover': {
              bgcolor: alpha(social.color, 0.4),  
              color: '#fff',  
            },
          }}
          onClick={() => window.open(social.path)}
        >
          <Iconify icon={social.icon} />
        </IconButton>
      ))}
    </Stack>
  );

  const renderEmission = (
    <Box
      sx={{
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 9,
        bgcolor: 'rgba(0, 0, 0, 0.8)',
        color: '#4F9FF5',
        borderRadius: 1,
        px: 1.5,
        py: 0.5,
        fontSize: 14,
        fontWeight: 500,
        boxShadow: '0 0 15px rgba(79, 159, 245, 0.5)',
        transition: 'box-shadow 0.3s ease',
        '&:hover': {
          boxShadow: '0 0 30px rgba(79, 159, 245, 1)',
        },
      }}
    >
      {emissionByPercent}% daily
    </Box>
  );

  const renderImages = (
    <Box sx={{ position: 'relative', borderRadius: '8px 8px 0 0', overflow: 'hidden' }}>
      {renderSocials} 
      {renderEmission} 
      <Image
        src={logoURL || '/assets/chains/eth-coin2.png'}
        alt={tokenName}
        sx={{
          width: '100%',
          height: '300px',  
          borderRadius: '8px 8px 0 0',  
          transition: 'transform 0.5s ease, box-shadow 0.5s ease',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',  
          },
        }}
      />
    </Box>
  );

  const renderTexts = (
    <ListItemText
      sx={{
        p: 2,
        cursor: 'pointer',
        textAlign: 'center',
        fontFamily: 'Poppins, Roboto, sans-serif',
        transition: 'color 0.4s ease, transform 0.3s ease',
        textShadow: '2px 2px 18px rgba(100, 165, 100, 0.8)',  
        '&:hover': {
          color: '#FF69B4',
          transform: 'scale(1.1)',  
          textShadow: '0px 0px 20px rgba(255, 105, 180, 0.7)',  
        },
      }}
      primary={`${tokenName} (${tokenSymbol})`}
      primaryTypographyProps={{
        typography: 'h4',
        fontWeight: 900,
        color: '#4A9FF5',
        textShadow: '0px 0px 15px rgba(79, 159, 245, 0.8)',  
      }}
    />
  );

  const renderInfo = (
    <Stack direction="row" alignItems="center" justifyContent="center" spacing={3} sx={{ pb: 3 }}>
      {[
        {
          label: "Visit Site",
          icon: (
            <Iconify
              icon="material-symbols:captive-portal"
              sx={{ color: '#FF69B4', cursor: 'pointer', fontSize: '22px' }}
              onClick={() => window.open(site)}
            />
          ),
        },
        {
          label: "GitHub",
          icon: (
            <Iconify
              icon="material-symbols:deployed-code-outline-sharp"
              sx={{ color: '#4F9FF5', cursor: 'pointer', fontSize: '22px' }}
              onClick={() => window.open(github)}
            />
          ),
        },
        {
          label: `${holders.length} Stakers`,
          icon: <Iconify icon="solar:users-group-rounded-bold" sx={{ color: '#8A2BE2', fontSize: '22px' }} />,
        },
      ].map((item, index) => (
        <Stack key={index} direction="row" alignItems="center" spacing={1}>
          {item.icon}
          {item.label}
        </Stack>
      ))}
    </Stack>
  );

  const renderFooterButtons = isAdmin ? (
    <AdminAction
      module={{ ...module, logoURL, socials, site, github, emissionByPercent }}
      setUpdater={setUpdater}
      sx={{
        background: 'linear-gradient(45deg, #00c6ff, #0072ff)',
        color: 'white',
        borderRadius: '1px',
        px: 3,
        py: 1,
        mt: 3,
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: '0 10px 20px rgba(0, 191, 255, 0.5)',
        },
      }}
    />
  ) : (
    <UserAction
      module={module}
      setUpdater={setUpdater}
      sx={{
        background: 'linear-gradient(45deg, #ff758c, #ff7eb3)',
        color: 'white',
        borderRadius: '8px',
        px: 3,
        py: 1,
        mt: 3,
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: '0 10px 20px rgba(255, 120, 180, 0.5)',
        },
      }}
    />
  );

  return (
    <Card
      sx={{
        transition: 'transform 0.4s ease, box-shadow 0.4s ease',
        '&:hover': {
          transform: 'translateY(-10px)',
          boxShadow: '0px 15px 40px rgba(0, 0, 0, 0.2)',
          borderColor: '#4F9FF5',
        },
        background: 'linear-gradient(145deg, #1E2022, #2D3135)',
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid transparent',
      }}
      onClick={() => handleModuleDetail()}
    >
      {renderImages}
      {renderTexts} 
      {renderInfo}  
      {renderFooterButtons}
    </Card>
  );
}
